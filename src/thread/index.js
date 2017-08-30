var schedule = require('node-schedule');
var moment = require('moment');
var GoogleSearch = require('google-search');
var itemWord; //IMPLEMENTAR INTERFACE
var async = require("async");
var modulevar = require('../variables');
var request = require('request');
import config from '../config.json';

module.exports = class Thread {
    constructor(listadoItems) {
        this.itemWord = listadoItems;
    }

    get(){
        return itemWord;
    }

    push(newItem){
        itemWord = newItem;
    }

    pushUserWord(userItem) {
        itemWord.items.push(userItem)
    }

    start(){
        
        var date = moment(this.itemWord.periodicity);
        var rule = new schedule.RecurrenceRule();
        rule.hour = date.hour();
        rule.minute = date.minutes();

        var th = schedule.scheduleJob({ rule }, function(itemWord){
            console.log("Poos me ejecuto", itemWord.tag);
            console.log("Para estas personas", itemWord.items.length);
            //console.log(this);
            if (itemWord.key == "NA" || itemWord.cx == "NA") {
                return;
            }

            var googleSearch = new GoogleSearch({
                key: itemWord.key,
                cx: itemWord.cx
            });

            googleSearch.build({
            q: itemWord.tag,
            googlehost: itemWord.url
            },
            function(error, response) {
                if (response != null ) {
                    
                    if (response.items != undefined ) {
                        //response.items.forEach(function(resultquery) {
                        async.each(response.items, function(resultquery, nextResultados) {
                            async.each(itemWord.items, function(userWord, nextUsuarios){
                                var notificacionexists = modulevar.getNotificaciones().some(function (item) {
                                    return item.userxdomainId == userWord.domainxuserId && item.urlresult == itemWord.url && item.tagperDomainxUserId == userWord.id;
                                });

                                if ( !notificacionexists ) {
                                    var currentnotificacion = {
                                        userxdomainId: userWord.domainxUserId,//No quiere este valore, revisar porque putas pasa
                                        urlresult: resultquery.link,
                                        tagperDomainxUserId: userWord.id,
                                        notify: false
                                    };
                                    
                                    var options = {
                                        method: 'post',
                                        body: currentnotificacion,
                                        json: true,
                                        url: config.baseurl + 'TagsperDomainsxUsers/'+userWord.id+'/notification'
                                    }

                                    request(options, function (err, res, body) {
                                        if (err) {
                                            console.log(err)
                                            return
                                        }
                                        //console.log(res)
                                        modulevar.addNotificacion(currentnotificacion);

                                        /*if(this.counterWords == this.itemWord) {
                                            console.log('Enviar correo a usuario');
                                            return;
                                        }*/
                                    });
                                }
                                nextUsuarios();
                            });
                            
                            nextResultados();
                        });
                        //No deberia de seguir, pero si lo hace no hace falta
                    }
                }
            });
        }.bind(null, this.itemWord));

        //Programar tarea
    }
}