angular.module('ngPresence.parameter', [
    'ui.router',
    'DataModule',
    'placeholders',
    'ui.bootstrap',
    'myTools'
])

.config(function config($stateProvider) {
    $stateProvider.state('parameter', {
        url: '/parameter',
        views: {
            "main": {
                controller: 'ParameterCtrl',
                templateUrl: 'parameter/parameter.tpl.html'
            }
        },
        data: {
            pageTitle: 'Paramètres'
        }
    });
})

.factory('ParameterFactory', function ParameterFactory(){
    var factory = {
        mail:{
            mailto : "guillaume.salicis@gmail.com",
            cc: "salicisguillaume@yahoo.fr",
            subject: "Absents",
            alert: 2,
            listformat: "%firstname%%tab%%lastname%%tab%%date%%tab%%course%",
            dateformat: "dd/MM/yyyy hh:mm",
            body: "Bonjour, \n\nVeuillez trouver ci-dessous la liste des élèves absents lors des derniers cours.\n\nListe:\n%list%\n\nCordialement,\n\nKévin."
        },
        general : {
            filename: 'fichier1'
        },
        configuration : {
            useAdditionalInfo : false
        }
    };
    return factory;
})

.factory('ExportFileFactory', ['CoreDataFactory', 'DataMngr', function ExportFileFactory(CoreDataFactory, DataMngr){
    var factory = {
        localSave : function(data, filename, filetype){
            var text;

            switch(filetype){
                case 'json':
                    text = factory.buildJson(data);
                break;
                case 'csv':
                    text = factory.buildCsv(data);
                break;
            }

            var blob = new Blob([text], {type: "text/plain;charset=utf-8"});
            saveAs(blob, filename + "." + filetype);
        },

        buildJson : function(data){
            return angular.toJson(data);
        },
        buildCsv : function(data){
            var studentCourses = CoreDataFactory.getSudentCourses();
            var coursesOcc = DataMngr.read('coursesOccurences');
            var ret = 'course;lastname;firstname;';

            for (var i = 0; i < studentCourses.length; i++){
                var sc = studentCourses[i];
                ret += sc.course.label +';';
                ret += sc.student.lastname +';';
                ret += sc.student.firstname +';';
                for(var j = 0; j < coursesOcc.length; j++){
                    var co = coursesOcc[j];
                    if(co.courseId == sc.course.id){
                        ret += CoreDataFactory.getStudentPresence(sc.student.id, co).present ? 'Y' : 'N' +';';
                    }
                } 
                ret += '\n';
            }
            return ret;
        },
        fileTypes : ['json', 'csv']
    };
    return factory;
}])

.controller('ParameterCtrl', ['$scope', '$timeout', '$http', 'Tools', 'ParameterFactory', 'DataMngr', 'ExportFileFactory', function ParameterCtrl($scope, $timeout, $http, Tools, ParameterFactory, DataMngr, ExportFileFactory) {
    var fakeDelay = 850;
    var mockDelay = function(scopeKey){
        $scope[scopeKey] = true;
        $timeout(function(){
        $scope[scopeKey] = false;
        }, fakeDelay);
    };

    $scope.isLoading = false;
    $scope.isExtLoading = false;
    $scope.isSaving = false;

    $scope.general = ParameterFactory.general;
    //$scope.ParameterFactory = ParameterFactory;
    $scope.mail = ParameterFactory.mail;
    $scope.configuration = ParameterFactory.configuration;
    $scope.regexps = Tools.regexps;

    // Type de sauvegarde
    $scope.fileTypes = ExportFileFactory.fileTypes;

    $scope.currFileType = $scope.fileTypes[0];

    $scope.exportData = function(filetype){
        DataMngr.offlinedata.envName = ParameterFactory.general.filename;
        return ExportFileFactory.localSave(DataMngr.offlinedata, ParameterFactory.general.filename, filetype);
    };
    $scope.saveData = function(){
        console.log('sauvegarde locale depuis param');
        DataMngr.save(ParameterFactory.general.filename);
        $scope.files = DataMngr.readFileList();
        mockDelay("isSaving");
    };
    $scope.isInitializingFile = false;
    $scope.initFile = function(filename){
        console.log("initFile");
        $scope.isInitializingFile = true;
        DataMngr.initFile(filename);
        $scope.files = DataMngr.readFileList();
        mockDelay("isInitializing");
        $scope.isInitializingFile = false;
    };

    $scope.setFileType = function(fileType){
        $scope.currFileType = fileType;
        console.log($scope.currFileType);
    };

    $scope.isGettingEnvList = false;
    getEnvList = function(){
        $scope.isGettingEnvList = true;
        console.log("getting env list");
        $http.get("/envlist/").success(function(data, status) {
            console.log("getting environment list success"), console.log(data), console.log(status);
            console.log(data);
            console.log(status);
            $scope.isGettingEnvList = false;
            $scope.isConnected = true;
            $scope.files = angular.fromJson(data);
        }).error(function(data, status) {
            console.log("getting environment list error !"), console.log(data), console.log(status);
            console.log(data);
            console.log(status);
            $scope.isGettingEnvList = false;
            $scope.isConnected = false;
            $scope.files = DataMngr.readFileList();
        });
    };
    getEnvList();

    $scope.filetoload = undefined;

    $scope.load = function(filename){
        DataMngr.load(filename);
        $scope.$emit('FILENAME_CHANGE', true);
        ParameterFactory.general.filename = filename;
        mockDelay("isLoading");
    };
    $scope.loadExtFileError = false;
    $scope.loadFile = function(){
        $scope.loadExtFileError = false;

        var reader = new FileReader();
        console.log($scope.externalfile);
        reader.onload = function(event) {
            var contents = event.target.result;
            console.log("File contents: " + contents);
            try{
                var data = angular.fromJson(contents);
                data.envName  =  data.envName ? data.envName:'tmpenvname';
                console.log("New env name : " + data.envName );
                DataMngr.saveFile(data.envName, data);
                DataMngr.load(data.envName);
                ParameterFactory.general.filename = data.envName;
                mockDelay("isExtLoading");
            } catch(e){
                $scope.loadExtFileError = true;
                console.log(e.message);
            }
        };

        reader.onerror = function(event) {
            console.error("File could not be read! Code " + event.target.error.code);
        };
        // émet des event
        var file = document.getElementById("idlocalfileinput").files[0];
        reader.readAsText(file);
    };


    $scope.createNew = function(filename){
        DataMngr.setCurrentFile(filename);
        DataMngr.saveFile(filename, angular.copy(DataMngr.pristineData));
        $scope.load(filename);
    };

    // Drop down de merde
    $scope.status = {
        isopen: false
    };
    $scope.toggleDropdown = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.status.isopen = !$scope.status.isopen;
    };
}])
;