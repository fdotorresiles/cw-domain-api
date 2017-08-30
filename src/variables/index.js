var COUNTER_GLOBAL = 0;
var WORKING_USERS = [];
var WORKING_DOMAINUSERS = [];
var PROGRAMER_DOMAINUSERS = [];
var COLA_NOTIFICACIONES = [];
//++++++++++++++++++++++++++++++++++++++++
var WORKING_WORDS_XTIME_XTEX = [];
var COUNTER_WORKINGW_READW = [];
var WORKING_MAILER = [];

module.exports = {
    addWkMailer: function(item){
        WORKING_MAILER.push(item);
    },
    getWkMailer: function(){
        return WORKING_MAILER;
    },
    addCounterWR: function(userCounterWR){
        COUNTER_WORKINGW_READW.push(userCounterWR);
    },
    getCounterWR: function(){
        return COUNTER_WORKINGW_READW;
    },
    addWorkingWord: function(word){
        WORKING_WORDS_XTIME_XTEX.push(word);
    },
    getWorkingWords: function(){
        return WORKING_WORDS_XTIME_XTEX;
    },
    initWorkingWords: function(listWords){
        WORKING_WORDS_XTIME_XTEX = listWords;
    },
    //++++++++++++++++++++++++++++++++++++++++
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