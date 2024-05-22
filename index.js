const fs = require('fs');
const express = require('express');
const app = express();
const dataFile = 'datos.json';
let carreras = [];
let carreraId = 1;

app.use(express.json());

const loadData = () => {
    if (fs.existsSync(dataFile)) {
        const data = fs.readFileSync(dataFile, 'utf8');
        if (data) {
            carreras = JSON.parse(data);
            if (carreras.length > 0) {
                carreraId = carreras[carreras.length - 1].id + 1;
            }
        }
    }
};

const saveData = () => {
    fs.writeFileSync(dataFile, JSON.stringify(carreras, null, 2));
};

loadData();

app.get('/carreras', (req, res) => {
    res.json(carreras);
});

app.post('/carreras', (req, res) => {
    const n = parseInt(req.query.n);
    const d = parseFloat(req.query.d);

    const corredores = [];
    for (let i = 0; i < n; i++) {
        const vel = Math.floor(Math.random() * (8 - 4 + 1)) + 4; // velocidad aleatoria entre 4 y 8 km/h
        const tllegada = d / vel; // Tiempo en horas

        const pausas = [];
        for (let j = 1; j < d; j++) {
            if (j % vel === 0) {
                const tiempoPausa = j / vel; // Tiempo en horas hasta la pausa
                pausas.push(`${j} km`); 
            }
        }

        corredores.push({ id: i + 1, vel, pausa: pausas.length, tllegada: `${tllegada.toFixed(2)} hrs`, pausas });
    }

    corredores.sort((a, b) => a.tllegada - b.tllegada); 

    const nuevaCarrera = {
        id: carreraId++,d, corredores
    };

    carreras.push(nuevaCarrera);
    saveData();
    res.status(201).json({ message: 'Carrera creada'});
});

app.put('/carreras/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const d = parseFloat(req.query.d);
    const n = parseInt(req.query.n);

    const carrera = carreras.find(c => c.id === id);
    if (carrera) {
        carrera.d = d;
        if (n) {
            const corredores = [];
            for (let i = 0; i < n; i++) {
                const vel = Math.floor(Math.random() * (8 - 4 + 1)) + 4; // velocidad aleatoria entre 4 y 8 km/h
                const tllegada = d / vel; // Tiempo en horas

                const pausas = [];
                for (let j = 1; j < d; j++) {
                    if (j % vel === 0) {
                        const tiempoPausa = j / vel; 
                        pausas.push(`${j} km`); 
                    }
                }

                corredores.push({ id: i + 1, vel, pausa: pausas.length, tllegada: `${tllegada.toFixed(2)} hrs`, pausas });
            }
            corredores.sort((a, b) => a.tllegada - b.tllegada);
            carrera.corredores = corredores;
        }
        saveData();
        res.json({ message: 'Carrera actualizada'});
    } 
});

app.delete('/carreras/:id', (req, res) => {
    const id = parseInt(req.params.id);

    const index = carreras.findIndex(c => c.id === id);
    if (index !== -1) {
        carreras.splice(index, 1);
        saveData();
        res.json({ message: 'Carrera eliminada' });
    } 
});

app.listen(3000, function () {
    console.log('Servidor corriendo en el puerto 3000');
});
