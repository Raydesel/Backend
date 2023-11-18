const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');

const app = express();
const port = 4053;

// Configuración de la conexión a la base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'biblioteca'
});

db.connect((err) => {
    if (err) {
        console.error('Error de conexión a la base de datos:', err);
    } else {
        console.log('Conexión a la base de datos establecida');
    }
});

app.use(bodyParser.json());

function verificaToken(req, res, next) {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ error: 'Acceso no autorizado. Token no proporcionado.' });
    }

    jwt.verify(token, 'secreto-seguro', (error, decoded) => {
        if (error) {
            return res.status(401).json({ error: 'Acceso no autorizado. Token inválido.' });
        }
        req.userId = decoded.userId;
        next();
    });
}

// Rutas
app.get('/', (req, res) => {
    res.send('¡Hola! Esta es la página de inicio.');
});

app.get('/about', (req, res) => {
    res.send('Bienvenido a la página "Acerca de nosotros".');
});

app.get('/contact', (req, res) => {
    res.send('Ponte en contacto con nosotros en contact@example.com.');
});

// Rutas para interactuar con procedimientos almacenados
// Ruta para agregar un nuevo usuario
app.post('/usuarios', verificaToken, (req, res) => {
    const { nombre, correo, contrasena } = req.body;

    db.query('CALL sp_insert_usuario(?, ?, ?)', [nombre, correo, contrasena], (error, results, fields) => {
        if (error) {
            console.error('Error al agregar usuario:', error);
            res.status(500).json({ error: 'Error al agregar usuario' });
        } else {
            res.json({ message: 'Usuario agregado exitosamente' });
        }
    });
});
// Ruta para eliminar un usuario por ID
app.delete('/usuarios/:id', verificaToken, (req, res) => {
    const usuarioId = req.params.id;

    db.query('CALL sp_delete_usuario(?)', [usuarioId], (error, results, fields) => {
        if (error) {
            console.error('Error al eliminar usuario:', error);
            res.status(500).json({ error: 'Error al eliminar usuario' });
        } else {
            res.json({ message: 'Usuario eliminado exitosamente' });
        }
    });
});
// Ruta para obtener todos los usuarios
app.get('/usuarios', verificaToken, (req, res) => {
    db.query('CALL sp_select_usuarios()', (error, results, fields) => {
        if (error) {
            console.error('Error al obtener usuarios:', error);
            res.status(500).json({ error: 'Error al obtener usuarios' });
        } else {
            res.json(results[0]); // Suponiendo que los resultados están en la primera posición del array
        }
    });
});

// Ruta para agregar un nuevo autor
app.post('/autores', verificaToken, (req, res) => {
    const { nombre } = req.body;

    db.query('CALL sp_insert_autor(?)', [nombre], (error, results, fields) => {
        if (error) {
            console.error('Error al agregar autor:', error);
            res.status(500).json({ error: 'Error al agregar autor' });
        } else {
            res.json({ message: 'Autor agregado exitosamente' });
        }
    });
});

// Ruta para eliminar un autor por ID
app.delete('/autores/:id', verificaToken, (req, res) => {
    const autorId = req.params.id;

    db.query('CALL sp_delete_autor(?)', [autorId], (error, results, fields) => {
        if (error) {
            console.error('Error al eliminar autor:', error);
            res.status(500).json({ error: 'Error al eliminar autor' });
        } else {
            res.json({ message: 'Autor eliminado exitosamente' });
        }
    });
});

// Ruta para obtener todos los autores
app.get('/autores', verificaToken, (req, res) => {
    db.query('CALL sp_select_autores()', (error, results, fields) => {
        if (error) {
            console.error('Error al obtener autores:', error);
            res.status(500).json({ error: 'Error al obtener autores' });
        } else {
            res.json(results[0]); // Suponiendo que los resultados están en la primera posición del array
        }
    });
});

// Ruta para agregar un nuevo libro
app.post('/libros', verificaToken, (req, res) => {
    const { titulo, autorId } = req.body;

    db.query('CALL sp_insert_libro(?, ?)', [titulo, autorId], (error, results, fields) => {
        if (error) {
            console.error('Error al agregar libro:', error);
            res.status(500).json({ error: 'Error al agregar libro' });
        } else {
            res.json({ message: 'Libro agregado exitosamente' });
        }
    });
});

// Ruta para eliminar un libro por ID
app.delete('/libros/:id', verificaToken, (req, res) => {
    const libroId = req.params.id;

    db.query('CALL sp_delete_libro(?)', [libroId], (error, results, fields) => {
        if (error) {
            console.error('Error al eliminar libro:', error);
            res.status(500).json({ error: 'Error al eliminar libro' });
        } else {
            res.json({ message: 'Libro eliminado exitosamente' });
        }
    });
});

// Ruta para obtener todos los libros
app.get('/libros', verificaToken, (req, res) => {
    db.query('CALL sp_select_libros()', (error, results, fields) => {
        if (error) {
            console.error('Error al obtener libros:', error);
            res.status(500).json({ error: 'Error al obtener libros' });
        } else {
            res.json(results[0]); // Suponiendo que los resultados están en la primera posición del array
        }
    });
});

// Ruta de login de tipo POST
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Verifica credenciales en la base de datos
    db.query('SELECT * FROM usuarios WHERE nombre = ? AND contraseña = ?', [username, password], (error, results, fields) => {
        if (error) {
            console.error('Error al verificar credenciales:', error);
            res.status(500).json({ error: 'Error al verificar credenciales' });
        } else {
            // Si hay resultados, las credenciales son válidas
            if (results.length > 0) {
                // Supongamos que obtienes el ID del usuario desde la base de datos
                const userId = results[0].id;

                // Genera el token con la información del usuario
                const token = jwt.sign({ userId }, 'secreto-seguro', { expiresIn: '1h' });

                res.json({ message: 'Inicio de sesión exitoso', token });
            } else {
                // Si no hay resultados, las credenciales son inválidas
                res.status(401).json({ error: 'Credenciales inválidas' });
            }
        }
    });
});

app.listen(port, () => {
    console.log(`Servidor Node.js en funcionamiento en el puerto ${port}`);
});
