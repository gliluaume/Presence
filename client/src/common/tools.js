
angular.module( 'myTools', [])
.factory('Tools', function Tools($http){
    var factory = {
        test : function(){
            return 'ok';
        },
        dayInYear : function (date){
            var start = new Date(date.getFullYear(), 0, 0);
            var diff = date - start;
            var oneDay = 1000 * 60 * 60 * 24;
            var day = Math.floor(diff / oneDay);
            console.log(day);
        },
        getWeekNumber : function (date) {
                // Copy date so don't modify original
                date = new Date(+date);
                date.setHours(0,0,0);
                // Set to nearest Thursday: current date + 4 - current day number
                // Make Sunday's day number 7
                date.setDate(date.getDate() + 4 - (date.getDay()||7));
                // Get first day of year
                var yearStart = new Date(date.getFullYear(),0,1);
                // Calculate full weeks to nearest Thursday
                var weekNo = Math.ceil(( ( (date - yearStart) / 86400000) + 1)/7);
                // Return array of year and week number
                return [date.getFullYear(), date.getMonth(), weekNo];
        },
        sendMail : function (maildesc) {
            if(maildesc){
                var link = "mailto:" + maildesc.mailto;
                if(maildesc.cc.length > 0){
                    link = link + "?cc=" + maildesc.cc;
                }
                link = link + "&subject=" + encodeURIComponent(maildesc.subject);
                link = link + "&body=" + encodeURIComponent(maildesc.body);
                window.location.href = link;
            } else {
                console.log("aucun paramètre de mail fournis");
            }
        },
        regexps: {
            onlynumbers: /^\d+$/,
            phonenum: /^\d{6,17}$/,
            filename: /^[a-z0-9]*$/gi
        },
        // element est un string ou un number seulement
        isElementInArray : function(element, array){
            var ret = false;
            if (((typeof element === 'string') || (typeof element === 'number')) && (typeof array === 'object')){
                for(var i = 0; i < array.length; i++){
                    if(array[i] === element){
                        ret = true;
                    }
                }
            } else {
                throw "unsupported type: " + typeof element; 
            }
            return ret;
        }
    };
    return factory;
})
;