angular.module('ngPresence.student', [
    'ui.router',
    'DataModule',
    'placeholders',
    'ui.bootstrap',
    'ngPresence.parameter',
    'ngPresence.core'
])

.config(function config($stateProvider) {
    $stateProvider.state('student', {
        url: '/student',
        views: {
            "main": {
                controller: 'StudentCtrl',
                templateUrl: 'student/student.tpl.html'
            }
        },
        data: {
            pageTitle: 'Etudiant'
        }
    });
})

.factory('StudentFactory', ['DataMngr', 'CoreDataFactory', function StudentFactory(DataMngr, CoreDataFactory) {
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
                lastname : regRepr.lastname,
                firstname : regRepr.firstname,
                email : regRepr.email,
                sex : regRepr.sex,
                id: regRepr.id  == null ? -1 : regRepr.id
            };
        },
        getRaw : function(type){
            return CoreDataFactory.getList(type);
        },
        update : function(student){
            return CoreDataFactory.updateStudent(factory.reprToData(student));
        },
        del : function(student){
            return CoreDataFactory.deleteStudent(student);
        },
        uiMessages : DataMngr.uiMessagesLang[0].messages
    };

    return factory;
}])

.controller('StudentCtrl', ['$scope', 'Tools', 'DataMngr', 'CoreFactory', 'ParameterFactory', 'StudentFactory', function PresenceCtrl($scope, Tools, DataMngr, CoreFactory, ParameterFactory, StudentFactory) {
    $scope.uiMessages = DataMngr.uiMessagesLang[0].messages;
    $scope.students = DataMngr.read('students');
    $scope.sexes = DataMngr.read('sexes');
    $scope.dispAddInfo = ParameterFactory.configuration.useAdditionalInfo;

    var resetNewStudent = function(){
        $scope.newStudent ={
            lastname : null,
            firstname : null,
            email : null,
            sex : 0
        };
    };
    resetNewStudent();

    $scope.lastname = null;
    $scope.firstname = null;
    $scope.email = null;
    $scope.predicate = undefined;
    $scope.reverses = {
        lastname: false,
        firstname: false,
        email: false
    };
    $scope.reverse = $scope.reverseLastname;
    $scope.setOrder= function(varName){
        $scope.predicate = varName;
        for(var item in $scope.reverses){
            if(item != varName){
                $scope.reverses[item] = false;
            }
        }
        $scope.reverses[varName] = !$scope.reverses[varName];
        $scope.reverse = $scope.reverses[varName];
    };

    $scope.addStudent = function(){
        console.log(
        DataMngr.writeItem('students', 
            {
                lastname : $scope.newStudent.lastname,
                firstname : $scope.newStudent.firstname,
                email : $scope.newStudent.email,
                sex : $scope.newStudent.sex,
                id : -1 
            }));
        $scope.students = DataMngr.read('students');

        $scope.newStudent = null;
        resetNewStudent();
    };
    $scope.saveStudent = function(student){
        console.log('saveStudent');
        $scope.students = StudentFactory.update(student);
        student.edit = !student.edit;
    };

    $scope.deleteStudent = function(s){
        var modalResult;
        var modal = CoreFactory.openModal ($scope, 'sm');
        modal.result.then(function (res) {
            modalResult = res;
            console.log('modalResult : ' + res);
            if(res ==='close'){
                DataMngr.deleteItem('students', s);
                $scope.$emit('STUDENT_REMOVE', s);
                // Recharge
                $scope.students = DataMngr.read('students');
            }
            }, function () {
            console.log('Modal dismissed at: ' + new Date());
        });
    };
}])
;