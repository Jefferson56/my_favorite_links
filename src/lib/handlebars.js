const {format}= require('timeago.js');

const helpers= {};

helpers.timeago= (timestamp) => {
    return format(timestamp);
};

module.exports= helpers;
//Método utilizado para formatear el tiempo