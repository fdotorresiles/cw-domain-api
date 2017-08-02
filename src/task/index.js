var schedule = require('node-schedule');
var modulevar = require('../variables');
var request = require('request');
var GoogleSearch = require('google-search');

export default ({ config }) => {

    // var rule = new schedule.RecurrenceRule();
    // rule.dayOfWeek = [0, new schedule.Range(4, 6)];
    // rule.hour = 17;
    // rule.minute = 0;
    request.get( config.baseurl + 'Notifications', function(err, response, body) {
        if (!err && response.statusCode == 200) {
            var notificaciones = JSON.parse(body);
            console.log("Notificaciones", notificaciones.length)
            if(notificaciones.length > 0 ){
                
                notificaciones.forEach(function(notificacion) {
                    modulevar.addNotificacion(notificacion)
                }, this);
            }
        }
    })

    var thdomainsxuser = schedule.scheduleJob({ rule: '*/5 * * * * *' }, function(){
        request.get( config.baseurl + 'DomainsperUsers?filter[where][active]=true' , function(err, response, body) {
            if (!err && response.statusCode == 200) {
                var wDomain = JSON.parse(body);
                console.log("Dominios usuarios", wDomain.length)
                wDomain.forEach(function(element) {

                    var userexist = modulevar.getWorkingDomain().some(function (item) {
                        return item.id == element.id;
                    });
                    
                    if( !userexist ) {   
                        modulevar.addWorkingDomain(element);
                    }

                }, this);
                
            }
        })
    });



    var thbusqueda = schedule.scheduleJob({ rule: '*/5 * * * * *' }, function(){

        if (modulevar.getWorkingDomain() != null ) {

            modulevar.getWorkingDomain().forEach(function(wdomain) {

                var programdomain = modulevar.getProgramerDomain().some(function (item) {
                    return item.id == wdomain.id;
                });

                if ( !programdomain ) {
                    modulevar.addProgramerDomain(wdomain)

                    var time = wdomain.periodicity.split(':');
                    var crule = new schedule.RecurrenceRule();
                    crule.hour = time[0];
                    crule.minute = time[1];

                    const itemRule = {
                        time: time,
                        programerDomain: wdomain
                    }

                    var job = new schedule.scheduleJob({ crule }, function(itemRule){
                        var current = new Date();
                        if(current.getMinutes() == itemRule.time[1] && current.getHours() == itemRule.time[0]) {
                            console.log(itemRule.programerDomain.id)
                            request.get( config.baseurl + 'DomainsperUsers/' + itemRule.programerDomain.id + '/tagperDomainxUsers?filter[where][active]=true' , function(err, response, body) {
                                if (!err && response.statusCode == 200) {
                                    var tagsxdomainxuser = JSON.parse(body);
                                    if(tagsxdomainxuser.length > 0 ){
                                        request.get( config.baseurl + 'Domains/'+ itemRule.programerDomain.domainId , function(err, response, body) {
                                            var domain = JSON.parse(body);
                                            
                                            var googleSearch = new GoogleSearch({
                                                key: domain.key,
                                                cx: domain.cx
                                            });

                                            tagsxdomainxuser.forEach(function(tagdomain) {
                                                googleSearch.build({
                                                q: tagdomain.tag,
                                                googlehost: domain.url // Restricts results to URLs from a specified site 
                                                }, 
                                                function(error, response) {
                                                    if (response != null ) {

                                                        if (response.error != undefined ) {
                                                            //console.log(response)
                                                        }

                                                        if (response.items != undefined ) {
                                                            response.items.forEach(function(resultquery) {

                                                                var notificacionexists = modulevar.getNotificaciones().some(function (item) {
                                                                    return item.userxdomainId == itemRule.programerDomain.id && item.urlresult == resultquery.link && item.searchtagdomainId == tagdomain.id;
                                                                });

                                                                console.log(notificacionexists)

                                                                if ( !notificacionexists ) {
                                                                    var currentnotificacion = {
                                                                        userxdomainId: itemRule.programerDomain.id,
                                                                        urlresult: resultquery.link,
                                                                        creationurlDate: resultquery.pagemap.metatags[0].creationdate,
                                                                        searchtagdomainId: tagdomain.id,
                                                                        notify: false
                                                                    };

                                                                    var options = {
                                                                        method: 'post',
                                                                        body: currentnotificacion,
                                                                        json: true,
                                                                        url: config.baseurl + 'Notifications'
                                                                    }

                                                                    request(options, function (err, res, body) {
                                                                        if (err) {
                                                                            console.log('Error :', err)
                                                                            return
                                                                        }
                                                                        modulevar.addNotificacion(currentnotificacion)
                                                                    });
                                                                }
                                                            }, this);
                                                        }
                                                    }
                                                });
                                            })
                                        });
                                    }
                                }
                            });
                        }

                    }.bind(this, itemRule));
                }
            }, this);
        }

    });
}




