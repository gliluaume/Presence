angular.module('ngPresence.level', [
    'ui.router',
    'DataModule',
    'placeholders',
    'ui.bootstrap',
    'ngPresence.core'
])

.config(function config($stateProvider) {
    $stateProvider.state('level', {
        url: '/level',
        views: {
            "main": {
                controller: 'LevelCtrl',
                templateUrl: 'level/level.tpl.html'
            }
        },
        data: {
            pageTitle: 'Niveaux'
        }
    });
})
/*
  S'occupe des données : 
   1. de leur transformation en vue de leur représentation ou stockage
   2. d'appeler les méthodes qui gèrent la cohérence (CoreDataFactory) 
   3. d'appeler les méthodes qui gèrent le stockage (DataMngr).
*/
.factory('LevelFactory', ['$filter','DataMngr', 'CoreDataFactory', function CourseFactory($filter, DataMngr, CoreDataFactory) {
    var factory = {
        padLeft0to99 : function(num){
            var ret;
            if(num < 10){
                ret = '0' + num.toString();
            } else {
                ret = num.toString();
            }
            return ret;
        },
        /* Transforme la donnée d'un cours en sa représentation */
        dataToRepr : function(levelData){
            var ret = angular.copy(courseOccData);
            return ret;
        },
        /* Transforme la représentation d'un cours en un objet décruvant la données stockée */
        reprToData : function(levelRepr){
            return {
                id: levelRepr.id  == null ? -1 : levelRepr.id,
                num: levelRepr.num,
                label: levelRepr.label
            };
        },
        getRaw : function(type){
            return DataMngr.read(type);
        },
        update : function(level){
            return CoreDataFactory.updateLevel(factory.reprToData(level));
        },
        del : function(level){
            return CoreDataFactory.deleteLevel(level);
        },
        uiMessages : DataMngr.uiMessagesLang[0].messages
    };

    return factory;
}])
.controller('LevelCtrl', ['$scope', 'LevelFactory', 'CoreFactory', function PresenceCtrl($scope, LevelFactory, CoreFactory) {
    $scope.levels = LevelFactory.getRaw('levels');
    $scope.uiMessages = LevelFactory.uiMessages;

    $scope.addLevel = function(){
        $scope.levels = LevelFactory.update($scope.newLevel);
        $scope.newLevel = {};
    };

    $scope.deleteLevel = function(l){
        var modalResult;
        var modal = CoreFactory.openModal ($scope, 'sm');
        modal.result.then(function (res) {
            modalResult = res;
            console.log('modalResult : ' + res);
            if(res ==='close'){
                $scope.levels = LevelFactory.del(l);
            }
            }, function () {
            console.log('Modal dismissed at: ' + new Date());
        });
    };
}])
;