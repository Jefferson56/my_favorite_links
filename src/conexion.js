const mysql= require('mysql');
const {promisify}= require('util'); //El promisify es un componente del módulo util de Node, convierte llamados en promesas

const {database}= require('./keys.js'); //Se importan los datos para conectar a la base de datos

const pool= mysql.createPool(database); //Se crea la conexión con la base de datos

pool.getConnection((err, connection) => { //Se obtiene la conexión
    if(err) { //Se evalúa si existe algún error con la conexión
        if(err.code === 'PROTOCOL_CONNECTION_LOST') { //Error de conexión cerrada
            console.error('DATABASE CONNETION WAS CLOSED');
        }
        if(err.code === 'ER_CON_COUNT_ERROR') { //Error de cantidad de conexiones con la base de datos
            console.error('DATABASE HAS TO MANY CONNECTIONS');
        }
        if(err.code === 'ECONNREFUSED') { //Error de conexión rechazada con la base de datos
            console.error('DATABASE CONNECTION WAS REFUSED');
        }
    }
    if(connection) connection.release(); //Establecer la conexión con la base de datos
     console.log('DATABASE IS CONNECTED');
     return;
});



pool.query= promisify(pool.query); //Convirtiendo a promesas lo que eran sólo llamados

module.exports= pool; //Se exporta la conexión para que pueda ser usada en otros módulos

