require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const HUBSPOT_HEADERS = {
    Authorization: `Bearer ${process.env.PRIVATE_APP_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
};

const OBJECT_TYPE = process.env.CUSTOM_OBJECT_ID;

// Ruta 1: GET / -> Mostrar tabla en la página principal
app.get('/', async (req, res) => {
    const url = `https://api.hubapi.com/crm/v3/objects/${OBJECT_TYPE}?properties=name,species,bio`;

    try {
        const response = await axios.get(url, { headers: HUBSPOT_HEADERS });
        const data = response.data.results;
        res.render('homepage', {
            title: 'Custom Objects | Integrating With HubSpot I Practicum',
            data
        });
    } catch (error) {
        console.error('Error fetching custom objects:', error.response ? error.response.data : error.message);
        res.status(500).send('Error loading custom objects.');
    }
});

// Ruta 2: GET /update-cobj -> Mostrar formulario
app.get('/update-cobj', (req, res) => {
    res.render('updates', {
        title: 'Update Custom Object Form | Integrating With HubSpot I Practicum'
    });
});

// Ruta 3: POST /update-cobj -> Crear registro y redirigir
app.post('/update-cobj', async (req, res) => {
    const { name, species, bio } = req.body;
    const url = `https://api.hubapi.com/crm/v3/objects/${OBJECT_TYPE}`;

    const newRecord = {
        properties: {
            name,
            species,
            bio
        }
    };

    try {
        await axios.post(url, newRecord, { headers: HUBSPOT_HEADERS });
        res.redirect('/');
    } catch (error) {
        console.error('Error creating custom object record:', error.response ? error.response.data : error.message);
        res.status(500).send('Error creating custom object.');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});