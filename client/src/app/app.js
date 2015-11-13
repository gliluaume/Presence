angular.module( 'ngPresence', [
    'myTools',
    'DataModule',
    'templates-app',
    'templates-common',
    'ngPresence.core',
    'ngPresence.parameter',
    'ngPresence.home',
    'ngPresence.about',
    'ngPresence.presence',
    'ngPresence.student',
    'ngPresence.course',
    'ngPresence.level',
    'ngPresence.registration',
    'ngPresence.schedule',
    'ngPresence.courseOccurrence',
    'ui.router',
    'ui.bootstrap'
])

.config( function myAppConfig ( $stateProvider, $urlRouterProvider ) {
    $urlRouterProvider.otherwise( '/presence' );
})
.constant('appCfg',{
    testDelay: 100000,
    testResource: '/callTest'
})
.run( function run (Tools, DataMngr) {
    console.log("init");
    var currWeek = Tools.getWeekNumber(new Date())[2];
    DataMngr.setup();
    console.log(DataMngr);  
})

.controller( 'AppCtrl', ['$rootScope', '$scope', '$location', '$interval', '$http', 'appCfg', 'CoreDataFactory', 'DataMngr', 'ParameterFactory', function AppCtrl ( $rootScope, $scope, $location, $interval, $http, appCfg, CoreDataFactory, DataMngr, ParameterFactory ) {
    $scope.general = ParameterFactory.general;
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
        if ( angular.isDefined( toState.data.pageTitle ) ) {
            $scope.pageTitle = toState.data.pageTitle + ' | ' + ParameterFactory.general.filename;
            // Pour gérer le cas où on n'a pas sauvegarder après édition on peut faire:
            // DataMngr.save();
            // Mais ça ralentit toute l'appli
        }
    });

    $scope.ManageCollapsibleMenuOnClick = function (){
        if(!$scope.menuCollapsed){
            $scope.menuCollapsed = true;
        }
    };

    // Charger un fichier. S'il n'y a rien (sachant qu'il y a toujours au moins debug) on crée le premier fichier par défaut:
    var defaultFilename = "MonEnvironnement";
    var fileList = DataMngr.readFileList();
    if(fileList.length > 0){
        DataMngr.load(DataMngr.getCurrentFile());
        ParameterFactory.general.filename = DataMngr.getCurrentFile();
    } else {
        ParameterFactory.general.filename = defaultFilename;
        DataMngr.currentFile = defaultFilename;
    }

    // test de la connexion
    $scope.isConnected = false;
    var testConnection = function(callback){
        
        $http.get(appCfg.testResource).
        success(function(data, status, headers, config) {
            $scope.isConnected = true;
            if (callback && angular.isFunction(callback)){
                callback();
            }
        }).
        error(function(data, status, headers, config) {
            $scope.isConnected = false;
        });
    };

    testConnection(function(){
        if (window.applicationCache.status !== 0){
            window.applicationCache.update();
            console.log('cache mis à jour');
        }
    });

    $interval(testConnection, appCfg.testDelay);


    $scope.configuration = ParameterFactory.configuration;
    $scope.isSaving = false;
    $scope.saveAll = function() {
        $scope.isSaving = true;
        DataMngr.save(ParameterFactory.general.filename);
        console.log(DataMngr.offlinedata);
        $http.post("/environment/", DataMngr.offlinedata).success(function(data, status) {
            console.log("write success !");
            console.log(status);
            $scope.isSaving = false;
        }).error(function(data, status) {
            console.log("write error !");
            console.log(data);
            console.log(status);
            $scope.isSaving = false;
        });
    };

    $scope.isGettingEnv = false;
    $scope.getEnv = function(){
        $scope.isGettingEnv = true;
        console.log("getting env <" + ParameterFactory.general.filename + ">");
        $http.get("/environment/" + JSON.stringify({name : ParameterFactory.general.filename})).success(function(data, status) {
            console.log("read success !"), console.log(data), console.log(status);
            DataMngr.saveFile(data.envName, data);
            DataMngr.load(data.envName);
            console.log(data);
            console.log(status);
            $scope.isGettingEnv = false;
        }).error(function(data, status) {
            console.log("read error !"), console.log(data), console.log(status);
            console.log(data);
            console.log(status);
            $scope.isGettingEnv = false;
        });
    };

    // On charge l'environnement par défaut au tout début (évite les problèmes d'écrasement)
    // NON !!! $scope.getEnv();
    CoreDataFactory.handleEvents($scope);
}])
;

