const express= require('express');
const router= express.Router();

const conexion= require('../conexion.js');

const {isLoggedIn}= require('../lib/auth');

router.get('/add', isLoggedIn, (req, res) => { //Se indica escuchar por la ruta /add
    res.render('links/add'); //Se renderiza la vista que se encuentra en la ruta links/add especificamente
});

router.post('/add', isLoggedIn, async (req, res) => { //La función flecha se convierte en asincrona
    const {title, url, description}= req.body; //Trae los valores guardados por el usuario en el formulario
    const newLink= { //Los guarda en un objeto que se llamará newLink
        title,
        url,
        description,
        user_id: req.user.id
    };
    await conexion.query('INSERT INTO links SET ?', [newLink]); //Espera a que se ejecute la consulta, en la consulta se envía el objeto con los datos a la base de datos
    req.flash('success','Link guardado correctamente'); //Mensaje que se muestra en el momento es que se guarda un nuevo link
    res.redirect('/links');
});

router.get('/', isLoggedIn, async (req, res) => { //Con isLoggedIn protegemos la ruta
const links= await conexion.query('SELECT * FROM links WHERE user_id = ?', [req.user.id]);
res.render('links/list', { links }); //Se le pasan los datos de la consulta a la vista list.hbs
});


router.get('/delete/:id', isLoggedIn, async (req, res) => { //Con isLoggedIn protegemos la ruta
    const id= req.params.id;
    await conexion.query('DELETE FROM links WHERE id = ?', [id]);
    req.flash('success', 'Link eliminado correctamente');
    res.redirect('/links');
});

router.get('/edit/:id', isLoggedIn, async (req, res) => { //Con isLoggedIn protegemos la ruta
   const {id}= req.params;
   const links= await conexion.query('SELECT * FROM links WHERE id = ?', [id]);
   res.render('links/edit', {link: links[0]});
});

router.post('/edit/:id', isLoggedIn, async (req, res) => { //Con isLoggedIn protegemos la ruta
    const {id}= req.params;
    const {title, url, description}= req.body;
    const updateLink= {
        title,
        url,
        description
    }
   await conexion.query('UPDATE links set ? WHERE id = ?', [updateLink, id]);
   req.flash('success', 'Link editado con exitosamente');
   res.redirect('/links');
});

module.exports= router;