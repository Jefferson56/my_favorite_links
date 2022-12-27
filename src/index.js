const express = require('express');
const morgan = require('morgan');
const exphbs = require('express-handlebars'); //Módulo para manejar motores de plantillas para las vistas
const path = require('path'); //Módulo para manejar las rutas
const flash= require('connect-flash'); //Este módulo es implementa para mostrar mensajes en las vistas
const session= require('express-session'); //Para que el módulo flash pueda funcionar debe tener una sesión
const mysqlStore= require('express-mysql-session');
const {database}= require('./keys');
const passport= require('passport');

//Inicialziaciones
const app = express();
require('./lib/passport'); //Se llama el módulo passport

//Configuraciones
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs.engine({ //Configuración para manejar las plantillas de handlebars
    defaultLayout: 'main', //Se establece main como la vista por defecto de todas las vistas
    layoutsDir: path.join(app.get('views'), 'layouts'), //Se establece la ruta, uniendo las la vista layouts a views
    partialsDir: path.join(app.get('views'), 'partials'), //Se establece la ruta, uniendo las la vista partials a views
    extname: '.hbs', //Se especifica que todas las vistas terminan en la extensión .hbs
    helpers: require('./lib/handlebars')
}));
app.set('view engine', '.hbs');

//Funciones que se ejecutan cada vez que un usuario envía una peticción --> Middleware
app.use(session({
    secret: 'linkssession',
    resave: false, //Se configura false para que no se empiece a renovar la sesión
    saveUninitialized: false, //Se configura para que no se vuelva a establecer la sesión
    store: new mysqlStore(database)
}));
app.use(flash());
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(passport.initialize()); //Se inincializa passport para poder hacer uso de sus métodos
app.use(passport.session()); //Se inicializa en session

//Variables globales
app.use((req, res, next) =>{
    app.locals.success= req.flash('success');
    app.locals.message= req.flash('message');
    app.locals.user= req.user; //Se almacena el usuario user y dicha variable puede ser accedida desde cualquier vista
    next();
});

//Rutas
app.use(require('./routes'));
app.use(require('./routes/authetication'));
app.use('/links', require('./routes/links'));

//Archivos públicos
app.use(express.static(path.join(__dirname, 'public')));

//Sección para inicializar el servidor
app.listen(app.get('port'), () => { //Se le indica a la aplicación que escuche a través del port
    console.log('Servidor funcionando a través del puerto', app.get('port'));
});