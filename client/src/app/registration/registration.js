angular.module('ngPresence.registration', [
    'ui.router',
    'DataModule',
    'ngPresence.core'
])

.config(function config($stateProvider) {
    $stateProvider.state('registration', {
        url: '/registration',
        views: {
            "main": {
                controller: 'RegistrationCtrl',
                templateUrl: 'registration/registration.tpl.html'
            }
        },
        data: {
            pageTitle: 'Inscriptions'
        }
    });
})
.factory('RegistrationFactory', ['DataMngr', 'CoreDataFactory', function RegistrationFactory(DataMngr, CoreDataFactory) {
    var factory = {
        /* Transforme la donnée d'un cours en sa représentation */
        dataToRepr : function(courseData){
            var ret = angular.copy(courseData);
            var h = factory.padLeft0to99(ret.hour);
            var m = factory.padLeft0to99(ret.minute);
            ret.hourlib = h + ":" + m;
            return ret;
        },
        /* Transforme la représentation d'un cours en un objet décruvant la données stockée */
        reprToData : function(regRepr){
            return {
                id: regRepr.id  == null ? -1 : regRepr.id,
                studentId: regRepr.studentId,
                courseId: regRepr.courseId
            };
        },
        getRaw : function(type){
            return CoreDataFactory.getList(type);
        },
        update : function(registration){
            return CoreDataFactory.updateRegistration(factory.reprToData(registration));
        },
        del : function(registration){
            return CoreDataFactory.deleteRegistration(registration);
        },
        uiMessages : DataMngr.uiMessagesLang[0].messages
    };

    return factory;
}])

.controller('RegistrationCtrl', ['$scope', '$modal', '$filter', 'Tools', 'RegistrationFactory', 'CoreFactory', function PresenceCtrl($scope, $modal, $filter, Tools, RegistrationFactory, CoreFactory) {
    console.log(new Date());
    $scope.registrations = RegistrationFactory.getRaw('studentRegistrations');
    $scope.courses = $filter('orderBy')(RegistrationFactory.getRaw('courses'), 'label');
    $scope.students = RegistrationFactory.getRaw('students');
    $scope.uiMessages = RegistrationFactory.uiMessages;
    console.log(new Date());
    $scope.isValidNewReg = function(newRegistration){
        console.log('isValidNewReg('+ newRegistration.id +')');
        console.log('isValidNewReg : ' + $filter('date')(new Date(), 'H:mm:ss.sss'));
        var ret;
        if(null == newRegistration){
            ret = false;
        } else {
            var studentRegistrations = RegistrationFactory.getRaw('studentRegistrations');
            ret = (newRegistration.courseId != null) && (newRegistration.studentId != null);
            if(ret){
                // N'est pas déjà inscrit ?
                for(var i = 0; i < studentRegistrations.length; i++){
                    if (studentRegistrations[i].courseId == newRegistration.courseId && 
                        studentRegistrations[i].studentId == newRegistration.studentId){
                        ret = false; 
                    }
                }
            }
        }
        console.log('isValidNewReg : ' + $filter('date')(new Date(), 'H:mm:ss.sss'));
        return ret;
    };
    $scope.saveRegistration = function(registration){
        console.log('saveRegistration');
        $scope.registrations = RegistrationFactory.update(registration);
        registration.edit = !registration.edit;
    };

    $scope.addRegistration = function(){
        console.log('addRegistration');
        $scope.registrations = RegistrationFactory.update($scope.newRegistration);
        $scope.newRegistration = $scope.newRegDefault;
    };

    $scope.newRegDefault = {};
    $scope.initNewReg = function(){
        console.log('initNewReg');
        $scope.newRegistration = $scope.newRegDefault;
    };

    $scope.setNewRegDefault = function(obj){
        console.log('setNewRegDefault');
        $scope.newRegDefault = obj;
    };



    $scope.deleteReg = function(r){
        var modalResult;
        var modal = CoreFactory.openModal($scope, 'sm');
        modal.result.then(function (res) {
            modalResult = res;
            console.log('modalResult : ' + res);
            if(res === 'close'){
                $scope.registrations = RegistrationFactory.del(r);
            }
        }, function () {
            console.log('Modal dismissed at: ' + new Date());
        });
    };
/*
    $scope.deleteRegNew = function(r){
        console.log('deleteReg');
        var modalResult;
        var modal = $modal.open({
            templateUrl: 'core/confirm.tpl.html',
            restrict: 'EA',
            controller: popupCtrl = function ($scope) {
                $scope.ok = function () {
                    modal.close('close');
                };
                $scope.cancel = function () {
                    modal.close('cancel');
                };
            },
            size: 'sm',
            resolve: {
                items: function () {
                   // mbBaseFunc.resize('main');
                    return $scope.items;
                }
            },
            backdrop: true
        });

        modal.result.then(function (res) {
            modalResult = res;
            console.log('modalResult : ' + res);
            if(res ==='close'){
                DataMngr.deleteAssociation('studentRegistrations', ['studentId', 'courseId'], r);
                $scope.$emit('REGISTRATION_REMOVE', r);
                // Recharge
                $scope.registrations = DataMngr.read('studentRegistrations');
            }
            }, function () {
            console.log('Modal dismissed at: ' + new Date());
        });
    };
*/


}])
;