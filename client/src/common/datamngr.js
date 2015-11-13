/*
    Est responsable de la sauvegarde des données mais pas du contenu. --> pourquoi on a les structures de données alors ?!?
*/

angular.module( 'DataModule', [])

.factory('SaveFactory', [function () {
    var factory = {

        save : function(varName, obj){
            var ret = false;
            if(varName){
                if(localStorage){
                    localStorage.setItem(varName, angular.toJson(obj));
                    ret = true;
                } else {
                    ret = false;
                }
            } else {
                throw "invalid variable name " + varName;
            }

            return ret;
        },

        get : function(varName){
            if(varName){
                if(localStorage){
                    var data = localStorage[varName];
                    return angular.fromJson(data);
                } else {
                    return null;
                }
            } else {
                throw "invalid variable name " + varName;
            }
        },

        reset : function(){
            if(localStorage){
                localStorage.clear();
            } else {
                return false;
            }
        }
    };
    return factory;
}])
/*
    Gère le stockage : vue emplacement physique des données mais aucun aspect conceptuel de données (pas de vue MCD, MDD).
    Seule condition: un objet a un attribut 'id'

    !!!!!!!!!!!! Découper ce truc on ne sait pus quel est son rôle !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/
.factory('DataMngr', ['$timeout', '$http', 'SaveFactory', function DataMngr($timeout, $http, SaveFactory){
    var factory = {
        modeDebug: false,
        
        debugData : {
                "levels": [
                    {
                        "id": 0,
                        "num": 0,
                        "label": "initiation"
                    }, {
                        "id": 1,
                        "num": 10,
                        "label": "débutant"
                    }, {
                        "id": 2,
                        "num": 20,
                        "label": "confirmé"
                    }, {
                        "id": 3,
                        "num": 30,
                        "label": "professionel"
                    }
                ],
                "days": [
                    {
                        "name": "monday",
                        "value": 1
                    }, {
                        "name": "tuesday",
                        "value": 2
                    }, {
                        "name": "wednesday",
                        "value": 3
                    }, {
                        "name": "thrusday",
                        "value": 4
                    }, {
                        "name": "friday",
                        "value": 5
                    }, {
                        "name": "saturday",
                        "value": 6
                    }, {
                        "name": "sunday",
                        "value": 0
                    }
                ],
                "recurrences": [
                    {
                        "id": 0,
                        "hours": 24,
                        "name": "daily"
                    }, {
                        "id": 1,
                        "hours": 168,
                        "name": "weekly"
                    }, {
                        "id": 2,
                        "name": "monthly"
                    }
                ],
                "courses": [
                    {
                        "id": 0,
                        "levelId": 0,
                        "label": "un-niv0",
                        "day": 1,
                        "hourlib": "17:00",
                        "hour": 17,
                        "minute": 0,
                        "recurrence": 1
                    }, {
                        "id": 1,
                        "levelId": 0,
                        "label": "deux-niv0",
                        "day": 1,
                        "hourlib": "18:00",
                        "hour": 18,
                        "minute": 0,
                        "recurrence": 1
                    }, {
                        "id": 2,
                        "levelId": 1,
                        "label": "trois-niv1",
                        "day": 2,
                        "hourlib": "19:00",
                        "hour": 19,
                        "minute": 0,
                        "recurrence": 1
                    }
                ],
                "students": [
                    {
                        "id": 0,
                        "firstname": "jean",
                        "lastname": "martin",
                        "email": "j.m@toto.com",
                        "sex": 1
                    }, {
                        "id": 1,
                        "firstname": "sylvie",
                        "lastname": "ploutoufin",
                        "email": "s.p@toto.com",
                        "sex": 0
                    }, {
                        "id": 2,
                        "firstname": "martine",
                        "lastname": "stupalacci",
                        "email": "s.m@toto.com",
                        "sex": 0
                    }, {
                        "id": 3,
                        "firstname": "marte",
                        "lastname": "la pierre",
                        "email": "ml@toto.com",
                        "sex": 0
                    }
                ],
                "sexes": [
                    {
                        "id": 0,
                        "name": "female"
                    }, {
                        "id": 1,
                        "name": "male"
                    }
                ],
                "periods": [
                    {
                        "id": 0,
                        "start": new Date("2014-11-03T11:00:00.000Z"),
                        "end": new Date("2014-11-30T11:00:00.000Z"),
                        "open": true
                    }, {
                        "id": 1,
                        "start": new Date("2014-12-07T11:00:00.000Z"),
                        "end": new Date("2014-12-13T11:00:00.000Z"),
                        "open": true
                    }
                ],
                "studentRegistrations": [
                    {
                        "studentId": 0,
                        "courseId": 0
                    }, {
                        "studentId": 1,
                        "courseId": 0
                    }, {
                        "studentId": 2,
                        "courseId": 0
                    }, {
                        "studentId": 3,
                        "courseId": 0
                    }, {
                        "studentId": 0,
                        "courseId": 1
                    }, {
                        "studentId": 3,
                        "courseId": 1
                    }, {
                        "studentId": 2,
                        "courseId": 2
                    }
                ],
                "coursesOccurences": [
                    {
                        "id": 0,
                        "courseId": 0,
                        "date": new Date("2014-11-03T16:00:00.000Z")
                    }, {
                        "id": 1,
                        "courseId": 1,
                        "date": new Date("2014-11-03T17:00:00.000Z")
                    }, {
                        "id": 2,
                        "courseId": 2,
                        "date": new Date("2014-11-04T18:00:00.000Z")
                    }, {
                        "id": 3,
                        "courseId": 0,
                        "date": new Date("2014-11-10T16:00:00.000Z")
                    }, {
                        "id": 4,
                        "courseId": 1,
                        "date": new Date("2014-11-10T17:00:00.000Z")
                    }, {
                        "id": 5,
                        "courseId": 2,
                        "date": new Date("2014-11-11T18:00:00.000Z")
                    }, {
                        "id": 6,
                        "courseId": 0,
                        "date": new Date("2014-11-17T16:00:00.000Z")
                    }, {
                        "id": 7,
                        "courseId": 1,
                        "date": new Date("2014-11-17T17:00:00.000Z")
                    }, {
                        "id": 8,
                        "courseId": 2,
                        "date": new Date("2014-11-18T18:00:00.000Z")
                    }, {
                        "id": 9,
                        "courseId": 0,
                        "date": new Date("2014-11-24T16:00:00.000Z")
                    }, {
                        "id": 10,
                        "courseId": 1,
                        "date": new Date("2014-11-24T17:00:00.000Z")
                    }, {
                        "id": 11,
                        "courseId": 2,
                        "date": new Date("2014-11-25T18:00:00.000Z")
                    }, {
                        "id": 12,
                        "courseId": 0,
                        "date": new Date("2014-12-08T16:00:00.000Z")
                    }, {
                        "id": 13,
                        "courseId": 1,
                        "date": new Date("2014-12-08T17:00:00.000Z")
                    }, {
                        "id": 14,
                        "courseId": 2,
                        "date": new Date("2014-12-09T18:00:00.000Z")
                    }
                ],
                "studentPresences": [
                    {
                        "studentId": 0,
                        "courseOccId": 0,
                        "present": false
                    }, {
                        "studentId": 1,
                        "courseOccId": 0,
                        "present": true
                    }, {
                        "studentId": 2,
                        "courseOccId": 0,
                        "present": true
                    }, {
                        "studentId": 3,
                        "courseOccId": 0,
                        "present": false
                    }, {
                        "studentId": 0,
                        "courseOccId": 1,
                        "present": false
                    }, {
                        "studentId": 3,
                        "courseOccId": 1,
                        "present": true
                    }, {
                        "studentId": 2,
                        "courseOccId": 2,
                        "present": true
                    }, {
                        "studentId": 0,
                        "courseOccId": 3,
                        "present": true
                    }, {
                        "studentId": 1,
                        "courseOccId": 3,
                        "present": true
                    }, {
                        "studentId": 2,
                        "courseOccId": 3,
                        "present": true
                    }, {
                        "studentId": 3,
                        "courseOccId": 3,
                        "present": false
                    }, {
                        "studentId": 0,
                        "courseOccId": 4,
                        "present": true
                    }, {
                        "studentId": 3,
                        "courseOccId": 4,
                        "present": true
                    }, {
                        "studentId": 2,
                        "courseOccId": 5,
                        "present": false
                    }, {
                        "studentId": 0,
                        "courseOccId": 6,
                        "present": true
                    }, {
                        "studentId": 1,
                        "courseOccId": 6,
                        "present": true
                    }, {
                        "studentId": 2,
                        "courseOccId": 6,
                        "present": false
                    }, {
                        "studentId": 3,
                        "courseOccId": 6,
                        "present": true
                    }, {
                        "studentId": 0,
                        "courseOccId": 7,
                        "present": false
                    }, {
                        "studentId": 3,
                        "courseOccId": 7,
                        "present": false
                    }, {
                        "studentId": 2,
                        "courseOccId": 8,
                        "present": true
                    }, {
                        "studentId": 0,
                        "courseOccId": 9,
                        "present": true
                    }, {
                        "studentId": 1,
                        "courseOccId": 9,
                        "present": true
                    }, {
                        "studentId": 2,
                        "courseOccId": 9,
                        "present": false
                    }, {
                        "studentId": 3,
                        "courseOccId": 9,
                        "present": true
                    }, {
                        "studentId": 0,
                        "courseOccId": 10,
                        "present": false
                    }, {
                        "studentId": 3,
                        "courseOccId": 10,
                        "present": true
                    }, {
                        "studentId": 2,
                        "courseOccId": 11,
                        "present": true
                    }, {
                        "studentId": 0,
                        "courseOccId": 12,
                        "present": false
                    }, {
                        "studentId": 1,
                        "courseOccId": 12,
                        "present": false
                    }, {
                        "studentId": 2,
                        "courseOccId": 12,
                        "present": true
                    }, {
                        "studentId": 3,
                        "courseOccId": 12,
                        "present": true
                    }, {
                        "studentId": 0,
                        "courseOccId": 13,
                        "present": false
                    }, {
                        "studentId": 3,
                        "courseOccId": 13,
                        "present": false
                    }, {
                        "studentId": 2,
                        "courseOccId": 14,
                        "present": false
                    }
                ]
        },


        pristineData : {
            levels:[],
            days:[
                {
                    "name": "monday",
                    "value": 1
                }, {
                    "name": "tuesday",
                    "value": 2
                }, {
                    "name": "wednesday",
                    "value": 3
                }, {
                    "name": "thrusday",
                    "value": 4
                }, {
                    "name": "friday",
                    "value": 5
                }, {
                    "name": "saturday",
                    "value": 6
                }, {
                    "name": "sunday",
                    "value": 0
                }
            ],

            recurrences:[],
            courses:[],
            students:[],
            sexes:[
                {
                    "id": 0,
                    "name": "female"
                }, {
                    "id": 1,
                    "name": "male"
                }
            ],
            periods:[],
            studentRegistrations:[],
            coursesOccurences:[],
            studentPresences:[]
        },
        // Initialise la structure des données
        setup :function(){
            if(factory.modeDebug){
                factory.offlinedata = factory.debugData;
                factory.saveFile("debug", factory.offlinedata);
            } else {
                // Vierge
                factory.offlinedata = angular.copy(factory.pristineData);
            }

        console.log('setup');
        console.log('data as JSON');
        console.log(JSON.stringify(factory.offlinedata));
        return true;
        },

        uiMessagesLang : [
            {
                'language' : 'français',
                'languageId' : 0,
                'messages': {
                    'languageName' : 'Langue',
                    'level': 'Niveau',
                    'lastname': 'Nom',
                    'label': 'Nom',
                    'firstname': 'Prénom',
                    'isPresent': 'Présent',
                    'mailto': 'Destinataire',
                    'send': 'Envoyer',
                    'add': 'Ajouter',
                    'edit': 'Modifier',
                    'day': 'Jour',
                    'email': 'courriel',
                    'course': 'cours',
                    'days':{
                        'monday': 'lundi',
                        'tuesday': 'mardi',
                        'wednesday': 'mercredi',
                        'thrusday': 'jeudi',
                        'friday': 'vendredi',
                        'saturday': 'samedi',
                        'sunday':'dimanche'
                    }
                }
            },
            {
                'language' : 'english',
                'languageId' : 1,
                'messages': {
                    'languageName' : 'Language',
                    'level': 'Level',
                    'lastname': 'Name',
                    'label': 'Label',
                    'firstname': 'Firstname',
                    'isPresent': 'Present',
                    'mailto': 'Recipient',
                    'send': 'Send',
                    'add': 'Add',
                    'edit': 'Edit',
                    'day': 'Day',
                    'email': 'e-mail',
                    'course': 'course',
                    'days':{
                        'monday':'monday',
                        'tuesday': 'tuesday',
                        'wednesday': 'wednesday',
                        'thrusday': 'thrusday',
                        'friday': 'friday',
                        'saturday': 'saturday',
                        'sunday':'sunday'
                    }
                }
            },
            {
                'language' : 'espanol',
                'languageId' : 2,
                'messages': {
                    'languageName' : 'Idioma',
                    'level': 'Nivel',
                    'lastname': 'Nombre',
                    'label': 'Denominacion',
                    'firstname': 'Prenombre',
                    'isPresent': 'Presente',
                    'mailto': 'Destinatorio',
                    'send': 'Mandar',
                    'add': 'Anadir',
                    'edit': 'Editar',
                    'day': 'Dia',
                    'email': 'e-mail',
                    'course': 'courso',
                    'days':{
                        'monday':'lunes',
                        'tuesday': 'martes',
                        'wednesday': 'miercoles',
                        'thrusday': 'jeudi',
                        'friday': 'vendredi',
                        'saturday': 'samedi',
                        'sunday':'dimanche'
                    }
                }
            }
        ],


        read : function(name){
            return factory.offlinedata[name];
        },
        write : function(name, value){
            factory.offlinedata[name] = value;
            factory.saveFile(factory.currentFile, factory.offlinedata);
        },
        /*
            Renvoie les objets de type
        */
        writeItem : function(type, value){
            var ret='';
            // On vérifie les entrées:
            if(!(factory.offlinedata[type])){
                throw "Invalid type " + type;
            }
            if(null == value.id){
                throw "Invalid object (no id)" + value;
            }
            // On écrase ou on crée
            for(var i = 0; i < factory.offlinedata[type].length; i++){
                if(factory.offlinedata[type][i].id == value.id){
                    factory.offlinedata[type][i] = value;
                    ret = "update";
                }
            }
            if(!ret){
                // Arrivé ici, on n'a pas trouvé, donc on crée
                value.id = factory.offlinedata[type].length;
                factory.offlinedata[type].push(value);
                ret = "add";
            }
            console.log(ret);
            // On sauvegarde localement
            factory.saveFile(factory.currentFile, factory.offlinedata);

            return ret;
        },
        writeItemAndRead : function(name, value){
            writeItem(name, value);
            return factory.read(type);
        },

        deleteItem : function(type, value){
            var ret='';
            // On vérifie les entrées:
            if(!(factory.offlinedata[type])){
                throw "Invalid type " + type;
            }
            if((undefined === value.id) || (null === value.id)){
                throw "Invalid object (no id)" + value;
            }
            // On supprime (on copie tout sauf celui à supprimer dans une nouvelle liste)
            var newItemsList = [];
            for(var i = 0; i < factory.offlinedata[type].length; i++){
                if(factory.offlinedata[type][i].id != value.id){
                    newItemsList.push(angular.copy(factory.offlinedata[type][i]));
                }
            }
            // On écrase l'ancienne liste
            factory.offlinedata[type] = newItemsList;
        },
        // Supprime une association pour les tables quoi n'ont pas de clé primaire id. type inscription:
        // {key1:1, key2:2} est une clé. c'est une généralisation de deleteItem puisqu'il prend pour clé primaire une liste de colonne. On peut faire le même traitement en appelant avec keys = ['id']
        deleteAssociation : function(type, keys, value){
            var ret='';
            if(!type || !keys || !value){
                throw "Invalid inputs";
            }
            // On vérifie les entrées:
            if(!(factory.offlinedata[type])){
                throw "Invalid type " + type;
            }

            // On supprime (on copie tout sauf celui à supprimer dans une nouvelle liste)
            var newItemsList = [];
            var equalsVal;
            for(var i = 0; i < factory.offlinedata[type].length; i++){
                equalsVal = true;
                for(var j = 0; j < keys.length; j++){
                    if(factory.offlinedata[type][i][keys[j]] != value[keys[j]]){
                        equalsVal = false;
                    }
                }
                if(!equalsVal){
                    newItemsList.push(angular.copy(factory.offlinedata[type][i]));
                }
            }
            // On écrase l'ancienne liste
            factory.offlinedata[type] = newItemsList;
        },
        dataKey : 'saveFiles',
        currEnvKey : 'currEnvKey',
        debugKey : 'saveFiles',
        files: [],
        // Le fichier environnement en cours d'utilisation ou le dernier utilisé
        currentFile : null,
        getCurrentFile : function(){
            var ret = SaveFactory.get('currEnvKey');
            if( ret) {
                return ret;
            } else {
                return null;
            } 
        },
        setCurrentFile : function(value){
            factory.currentFile = value;
            factory.offlinedata.envName = value;
            SaveFactory.save(factory.currEnvKey, value);
        },
        /*
            saveFiles:
            [
                {
                    filename: <name>,
                    data: <data>
                }
            ]
        */
        actionDelay : 5 * 1000,
        pending : undefined,
        // allData constitue tous les projets ie tous les fichiers
        saveFile : function(filename, obj){
            if(filename){
                console.log("saveFile " + filename);
                var updated = false;
                var objToSave = {filename : filename, data : obj};
                var alldata = SaveFactory.get(factory.dataKey);
                if(!alldata){
                    alldata = [objToSave];
                }
                for(var i = 0 ;  i < alldata.length; i++){
                    if(alldata[i].filename === filename){
                        alldata[i] = objToSave;
                        updated = true;
                    }
                }
                // Si on passe dans le if c'est que c'est un nouveau
                if(!updated){
                    alldata.push(objToSave);
                }
                // On sauvegarde l'ensemble des données:
                // 1. localement
                SaveFactory.save(factory.dataKey, alldata);
                // 2. sur le serveur (on attend un peu de savoir s'il y a une autre action avant de sauvegarder)
                if(factory.pending){
                    console.log('save order cancel for new data version');
                    $timeout.cancel(factory.pending);
                }
                factory.pending = $timeout(function(){
                    $http.post("/environment/", factory.offlinedata).success(function(data, status) {
                        console.log("write success from DataMngr");
                    }).error(function(data, status) {
                        console.log("write error from DataMngr!");
                        console.log(status);
                    });
                }, factory.actionDelay);
            } else {
                throw "not defined filename param " + filename;
            }

        },
        __getFileList: function(){
            var ret = [];
            var alldata = SaveFactory.get(factory.dataKey);
            if(alldata){
                for(var i = 0; i < alldata.length; i++){
                    ret.push(alldata[i].filename);
                }
            }
            return ret;
        },
        getFile: function(name){
            var ret = null;
            var alldata = SaveFactory.get(factory.dataKey);
            for(var i = 0; i < alldata.length; i++ ){
                if(alldata[i].filename ===  name){
                    ret = alldata[i].data;
                }
            }

            return ret;
        },
        readFileList : function(nodebug){
            console.log("readfilelist");
            factory.files = factory.__getFileList();
            /*
            var containDebug = false;
            for(var k in factory.files){
                if(k === 'debug'){
                    containDebug = true;
                }
            }
            if(!containDebug && !nodebug){
                factory.files.unshift('debug');
            }*/

            return factory.files;
        },

        deleteFile: function(filename){
            var ret = false;
            if(filename){
                var newAlldata = [];
                var alldata = SaveFactory.get(factory.dataKey);
                if(alldata){
                    for(var i = 0; i < alldata.length; i++){
                        if(alldata[i].filename != filename){
                            newAlldata.push(alldata[i]);
                        }
                    }
                    alldata = newAlldata;
                    ret = SaveFactory.save(factory.dataKey, alldata);
                }
            }
            return ret;
        },

        initFile: function(filename){
            var ret = false;
            if(filename){
                var newAlldata = [];
                var alldata = SaveFactory.get(factory.dataKey);
                if(alldata){
                    for(var i = 0; i < alldata.length; i++){
                        if(alldata[i].filename != filename){
                            newAlldata.push(alldata[i]);
                        } else {
                            newAlldata.push(angular.copy(factory.pristineData));
                        }
                    }
                    alldata = newAlldata;
                    ret = SaveFactory.save(factory.dataKey, alldata);
                }
                console.log(alldata);
            }
            console.log("DataMngr.initFile");

            return ret;
        },
        clearFile: function(filename){
            factory.saveFile(filename, null);
        },

        clearAllFiles:function(){
            SaveFactory.reset();
        },


        // On positionne aussi currentFile
        save: function(filename){
            var ret = false; 
            var curr = filename == null ? factory.getCurrentFile() : filename;
            
            if(filename){
                factory.setCurrentFile(filename);
            }
            if(curr){
                factory.offlinedata.envName = curr;
                factory.saveFile(curr, factory.offlinedata);
                console.log("save in " + curr);
            } else {
                throw "save in <" + filename + "> failed";
            }

            return ret;
        },

        // On positionne aussi currentFile
        load: function(filename){
            var ret = false; 
            if(filename){
                factory.setCurrentFile(filename);
                if(filename == 'debug'){
                    factory.offlinedata = factory.debugData;
                    ret = true;
                } else {
                    var tmp = null;
                    
                    try{
                        tmp = factory.getFile(filename);
                        console.log("load " + filename);
                    } catch(err) {
                        console.log("load failed");
                        console.log(err);
                    }
                    
                    if(tmp != null){
                        factory.offlinedata = tmp;
                        ret = true;
                    }
                }
            } else {
                console.log("load " + filename + " failed");
            }
            return ret;
        },

        offlinedata : {

        }
    };
    return factory;
}])


.factory('ConnexionMngr', [function DataMngr(){
    var factory = {

    };
    return factory;
}])

;