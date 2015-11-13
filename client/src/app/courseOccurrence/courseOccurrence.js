angular.module('ngPresence.courseOccurrence', [
    'ui.router',
    'DataModule',
    'placeholders',
    'ngPresence.core',
    'ui.bootstrap'
])

.config(function config($stateProvider) {
    $stateProvider.state('courseOccurrence', {
        url: '/courseOccurrence',
        views: {
            "main": {
                controller: 'CourseOccurrenceCtrl',
                templateUrl: 'courseOccurrence/courseOccurrence.tpl.html'
            }
        },
        data: {
            pageTitle: 'Occurrence des cours'
        }
    });
})
/*
  S'occupe des données : 
   1. de leur transformation en vue de leur représentation ou stockage
   2. d'appeler les méthodes qui gèrent la cohérence (CoreDataFactory) 
   3. d'appeler les méthodes qui gèrent le stockage (DataMngr).
*/
.factory('CourseOccFactory', ['$filter','DataMngr', 'CoreDataFactory', function CourseFactory($filter, DataMngr, CoreDataFactory) {
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
        dataToRepr : function(courseOccData){
            var ret = angular.copy(courseOccData);
            ret.tmpDay = $filter('date')(ret.date, 'yyyy-MM-dd');
            ret.tmpTime = $filter('date')(ret.date, 'HH:mm');
            return ret;
        },
        /* Transforme la représentation d'un cours en un objet décruvant la données stockée */
        reprToData : function(courseOccRepr){
            var newDate = new Date(courseOccRepr.tmpDay + ' ' + courseOccRepr.tmpTime);
            return {
                id: courseOccRepr.id  == null ? -1 : courseOccRepr.id,
                courseId: courseOccRepr.courseId,
                date: angular.copy(newDate)
            };
        },
        getRaw : function(type){
            return DataMngr.read(type);
        },
        update : function(courseOcc){
            return CoreDataFactory.updateCourseOcc(factory.reprToData(courseOcc));
        },
        del : function(courseOcc){
            return CoreDataFactory.deleteCourseOcc(courseOcc);
        },
        uiMessages : DataMngr.uiMessagesLang[0].messages
    };

    return factory;
}])

.controller('CourseOccurrenceCtrl', ['$scope', 'CoreFactory', 'CoreDataFactory', 'CourseOccFactory', function PresenceCtrl($scope, CoreFactory, CoreDataFactory, CourseOccFactory) {
    $scope.uiMessages = CourseOccFactory.uiMessages;
    $scope.coursesOccurences = CourseOccFactory.getRaw('coursesOccurences');
    $scope.courses = CourseOccFactory.getRaw('courses');

    // Mise en forme
    var disp = function(){
        for (var i = 0; i < $scope.coursesOccurences.length; i++){
            $scope.coursesOccurences[i] = CourseOccFactory.dataToRepr($scope.coursesOccurences[i]);
        }
    };
    disp();

    $scope.existsNewCourseOcc = function(courseOcc){
        if(courseOcc){
            courseOcc.date = new Date($scope.newCourseOccDay+' '+$scope.newCourseOccTime);
            return CoreDataFactory.existsCourseOcc(courseOcc);
        } else {
            return false;
        }
    };
    $scope.addCourseOcc = function(){
        $scope.coursesOccurences = CourseOccFactory.update($scope.newCourseOcc);
        $scope.newCourseOcc = null;
        disp();
    };

    $scope.save = function(courseOcc){
        $scope.coursesOccurences = CourseOccFactory.update(courseOcc);
        courseOcc.edit =! courseOcc.edit;
    };
    
    $scope.deleteOcc = function(c){
        var modalResult;
        var modal = CoreFactory.openModal ($scope, 'sm');
        modal.result.then(function (res) {
            modalResult = res;
            console.log('modalResult : ' + res);
            if(res === 'close'){
                $scope.coursesOccurences = CourseOccFactory.del(c);
            }
            }, function () {
            console.log('Modal dismissed at: ' + new Date());
        });
    };
}])
;