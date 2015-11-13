angular.module('ngPresence.course', [
    'ui.router',
    'DataModule',
    'placeholders',
    'ui.bootstrap',
    'ngPresence.parameter',
    'ngPresence.core'
])

.config(function config($stateProvider) {
    $stateProvider.state('course', {
        url: '/course',
        views: {
            "main": {
                controller: 'CourseCtrl',
                templateUrl: 'course/course.tpl.html'
            }
        },
        data: {
            pageTitle: 'Cours'
        }
    });
})
/*
  S'occupe des données : 
   1. de leur transformation en vue de leur représentation ou stockage
   2. d'appeler les méthodes qui gèrent la cohérence (CoreDataFactory) 
   3. d'appeler les méthodes qui gèrent le stockage (DataMngr).
*/
.factory('CourseFactory', ['DataMngr', 'CoreDataFactory', function CourseFactory(DataMngr, CoreDataFactory) {
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
        dataToRepr : function(courseData){
            var ret = angular.copy(courseData);
            var h = factory.padLeft0to99(ret.hour);
            var m = factory.padLeft0to99(ret.minute);
            ret.hourlib = h + ":" + m;
            return ret;
        },
        /* Transforme la représentation d'un cours en un objet décruvant la données stockée */
        reprToData : function(courseRepr){
            var tmpHour = parseInt(courseRepr.hourlib.split(":")[0], 10);
            var tmpMinute = parseInt(courseRepr.hourlib.split(":")[1], 10);
            return {
                id: courseRepr.id  == null ? -1 : courseRepr.id,
                levelId: courseRepr.levelId,
                label: courseRepr.label,
                day: courseRepr.day,
                hour: tmpHour,
                minute: tmpMinute,
                site : courseRepr.site,
                duration : courseRepr.duration
            };
        },
        getRaw : function(type){
            return CoreDataFactory.getList(type);
        },
        update : function(course){
            return CoreDataFactory.updateCourse(factory.reprToData(course));
        },
        del : function(course){
            return CoreDataFactory.deleteCourse(course);
        },
        uiMessages : DataMngr.uiMessagesLang[0].messages
    };

    return factory;
}])

.controller('CourseCtrl', ['$scope', 'ParameterFactory', 'CoreFactory', 'CourseFactory', function CourseCtrl($scope, ParameterFactory, CoreFactory, CourseFactory) {
    $scope.uiMessages = CourseFactory.uiMessages;
    $scope.dispAddInfo = ParameterFactory.configuration.useAdditionalInfo;
    $scope.levels = CourseFactory.getRaw('levels');
    $scope.days = CourseFactory.getRaw('days');

    disp = function(){
        $scope.courses = CourseFactory.getRaw('courses');
        for(var i = 0; i < $scope.courses.length; i++){
            $scope.courses[i] = CourseFactory.dataToRepr($scope.courses[i]);
        }
    };
    disp();

    $scope.saveCourse = function(course){
        $scope.courses = CourseFactory.update(course);
        course.edit = !course.edit;
    };
    
    $scope.addCourse = function(){
        $scope.courses = CourseFactory.update($scope.newCourse);
        $scope.newCourse = null;
        disp();
    };

    $scope.deleteCourse = function(c){
        var modalResult;
        var modal = CoreFactory.openModal ($scope, 'sm');
        modal.result.then(function (res) {
            modalResult = res;
            console.log('modalResult : ' + res);
            if(res ==='close'){
                $scope.courses = CourseFactory.del(c);
            }
            }, function () {
            console.log('Modal dismissed at: ' + new Date());
        });
    };
}])
;