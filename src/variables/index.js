var COUNTER_GLOBAL = 0;
var WORKING_USERS = [];
var WORKING_DOMAINUSERS = [];
var PROGRAMER_DOMAINUSERS = [];
var COLA_NOTIFICACIONES = [];

module.exports = {
    addCounter: function() {
        COUNTER_GLOBAL += 1
    },
    getCounter: function() {
        return COUNTER_GLOBAL;
    },
    addUser: function(user){
        WORKING_USERS.push(user)
    },
    getWorkinUsers: function(){
        return WORKING_USERS;
    },
    addWorkingDomain: function(domainxuser){
        WORKING_DOMAINUSERS.push(domainxuser)
    },
    getWorkingDomain: function(){
        return WORKING_DOMAINUSERS;
    },
    addProgramerDomain: function(domainxuser){
        PROGRAMER_DOMAINUSERS.push(domainxuser)
    },
    getProgramerDomain: function(){
        return PROGRAMER_DOMAINUSERS;
    },
    addNotificacion: function(notificacion){
        COLA_NOTIFICACIONES.push(notificacion)
    },
    getNotificaciones: function(){
        return COLA_NOTIFICACIONES;
    }

}