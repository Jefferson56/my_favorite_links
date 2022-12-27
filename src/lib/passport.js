const passport= require('passport'); //Manejo de las autentiaciones con el módiulo  passport
const LocalStrategy= require('passport-local').Strategy; //Para utilizar el validador local, para el servidor local

const conexion= require('../conexion.js');
const helpers= require('../lib/helpers.js'); //Se importa el módulo helpers para hacer uso de sus funciones

passport.use('local.signin', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, username, password, done) => {
   const rows= await conexion.query('SELECT * FROM users WHERE username= ?', [username]); //Se realiza la consulta para saber si ese usuario si existe en la base de datos, si la respuesta es si, devuleve un arreglo de varias filas
   if(rows.length > 0) { //Se evalúa si el tamaño del arreglo es superior a cero
    const user= rows[0]; //Se obtiene el arreglo devuelto en la posición cero
    const validPassword= await helpers.loginPassword(password, user.password); //Se valida que las password sean iguales cuando el usuario hace login
    if(validPassword){ //Si la respuestas es true, se envía el usuario y un mensaje de bienvenida
        done(null, user, req.flash('success', 'Bienvenido' + user.username)); //
    } else {
        done(null, false, req.flash('message', 'Contraseña incorrecta'));
    }
   } else {
    return done(null, false, req.flash('message', 'El nombre de usuario no existe'));
   }

}));

passport.use('local.signup', new LocalStrategy({
    usernameField: 'username', //Se traen los datos desde el registro de usuario
    passwordField: 'password',
    passReqToCallback: true //Para recibir el request dentro de la función LocalStrategy
}, async (req, username, password, done) => {
    //Registro de usuarios
    const {fullname}= req.body;
    const newUser= {
        username,
        password,
        fullname
    };
    try {
        newUser.password= await helpers.encryptPassword(password); //Se le envía la password para ser encriptada y luego es guardada en la propiedad password del objeto newUser
        const result= await conexion.query('INSERT INTO users SET ?', [newUser]);
        req.flash('success','Usuario registrado con éxito'); //Mensaje que se muestra en el momento en que se guarda un usuario
        newUser.id= result.insertId; //Se le agg la propiedad id al objeto newUser, con el valor devuelto en el result de la consulta (insertId)
        return done(null, newUser); //Le envía a la llamada done() null para indicar que no hubieron errores y devuelve newUser para que sea almacenado en una sesión
    } catch (error) {
        if(error.code === 'ER_DUP_ENTRY'){
            req.flash('message','El nombre de usuario ya existe'); //Mensaje que se muestra en el momento en que el usuario está registrando un nuevo nombre de usuario
            return done('', ''); //Le envía a la llamada done() vacío para el error y vacío para la sesión, de esta manera le puedo enviar el mensaje al usuario de que dicho usuario ya existe
        }
    }
}));

passport.serializeUser((user, done) => { //Método usado para guardar el usuario en la sesión
    done(null, user.id); //Se envía null para un error y id del user para guardar el usuario en la sesión
});

passport.deserializeUser(async (id, done) => { //
   const rows= await conexion.query('SELECT * FROM users WHERE id = ?', [id]); //Devuleve un arreglo de varias
   done(null, rows[0]); //rowa[0] duvuelve el objeto en la posición cero del arreglo
});