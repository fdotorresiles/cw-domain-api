var schedule = require('node-schedule');
var modulevar = require('../variables');
var thread = require('../thread');
var mail = require('../mail');
var request = require('request');


export default ({ config }) => {

    //Cargar notificaciones para no hacer un get x validación
    request.get( config.baseurl + 'Notifications', function(err, response, body) {
        if (!err && response.statusCode == 200) {
            var notificaciones = JSON.parse(body);
            if(notificaciones.length > 0 ){
                
                notificaciones.forEach(function(notificacion) {
                    modulevar.addNotificacion(notificacion)
                }, this);
            }
        }
    });

    //Inicializar hilo para actualizar lista de tareas
    //Cada 5 minutos estara realizando este proceso
    var thdomainsxuser = schedule.scheduleJob({ rule: config.tiempoGlobalThread }, function(){
        //mail
        request.get( config.baseurl + 'DomainsperUsers', function(err, response, body) {
            if (!err && response.statusCode == 200) {
                var domainXUsers = JSON.parse(body);
                domainXUsers.forEach(function(element) {
                    var mailerExist = modulevar.getWkMailer().some(function (item) {
                        return item.id == element.id;
                    });
                    if(!mailerExist){
                        var mailer = new mail();
                        mailer.start(element);
                        modulevar.addWkMailer(element);
                    }
                }, this);
            }
        });

        if (modulevar.getWorkingWords().length === 0) {
            request.get( config.baseurl + 'DomainsperUsers/getAllWorkingWords', function(err, response, body) {
                if (!err && response.statusCode == 200) {
                    var workingWords = JSON.parse(body);
                    console.log(workingWords.result.length);
                    if(workingWords.result.length > 0 ) {
                        modulevar.initWorkingWords(workingWords.result);
                        //AQUI ESTUVO
                        workingWords.result.forEach(function(element) {
                            var work = new thread(element);
                            work.start()
                            
                        }, this);
                    }
                }
            });
            //Primera vez
            //Obtener grupo de palabras 
        } else {
            //Segunda vez
        }
    })
}