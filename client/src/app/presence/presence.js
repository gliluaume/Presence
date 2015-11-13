angular.module('ngPresence.presence', [
    'ui.router',
    'DataModule',
    'placeholders',
    'ui.bootstrap',
    'ngPresence.core',
    'ngPresence.parameter'
])

.config(function config($stateProvider) {
    $stateProvider.state('presence', {
        url: '/presence',
        views: {
            "main": {
                controller: 'PresenceCtrl',
                templateUrl: 'presence/presence.tpl.html'
            }
        },
        data: {
            pageTitle: 'Présence'
        }
    });
})
.factory('PresenceFactory', ['$filter', 'Tools', 'DataMngr', 'ParameterFactory', 'CoreFactory', 'CoreDataFactory', function PresenceFactory($filter, Tools, DataMngr, ParameterFactory, CoreFactory, CoreDataFactory){

    var factory = {        
        buildMail : function(){
            var newMail = angular.copy(ParameterFactory.mail);
            var stuList = factory.requestMailStudentList(newMail.alert); 
            var listText = '';
            for(var i = 0; i < stuList.length; i++){
                var tmp = '';
                try{
                    tmp = newMail.listformat.replace(/%lastname%/g, stuList[i].student.lastname)
                                .replace(/%firstname%/g, stuList[i].student.firstname)
                                .replace(/%course%/g, stuList[i].course.label)
                                .replace(/%date%/g, $filter('date')(stuList[i].courseOcc.date, newMail.dateformat))
                                .replace(/%tab%/g, '\t').replace(/%ret%/g, '\n') + '\n';
                } catch(e){
                    console.log(e);
                    console.log('stuList[' + i +'] :');
                    console.log(stuList[i]);
                    throw e;
                }
                listText += tmp;
                /*
                listText +=  stuList[i].student.lastname + ', ' + stuList[i].student.firstname + '\t';
                listText +=  stuList[i].course.label + '\t';
                listText +=  $filter('date')(stuList[i].courseOcc.date, 'dd/MM/yyyy hh:mm') + '\n';
                */
            }
            newMail.body = newMail.body.replace('%list%', listText);
            console.log(listText);
            console.log(newMail.body);
            return newMail;
        },
        requestMailStudentList : function(coursesNum){
            var ret;
            // Pour chaque cours on cherche les occurrences de cours les plus proches de la date actuelle:
            // coursesOccIds est un dictionnaire avec pour clé les Id de cours et pour valeur une liste d'occurrence
            var coursesOccIds = {};

            // Pour chaque instance on prend toutes les dates dans le passé par rapport à la date actuelle
            var now = new Date();
            var coursesOcc = DataMngr.read('coursesOccurences');
            for(var i = 0; i < coursesOcc.length; i++){
                if(now - coursesOcc[i].date > 0){
                    if(coursesOccIds[coursesOcc[i].courseId]){
                        // On prend systématiquement
                        coursesOccIds[coursesOcc[i].courseId].push(coursesOcc[i]);
                    } else {
                        coursesOccIds[coursesOcc[i].courseId] = [coursesOcc[i]];
                    }
                }
            }

            console.log('coursesOccIds intermédiaire');
            console.log(coursesOccIds);
            // On trie chaque courseOccIds dans l'ordre décroissant des dates
            for(var j in coursesOccIds){
                coursesOccIds[j] = $filter('orderBy')(coursesOccIds[j], '-date');
            }
            // On coupe les tableaux
            for(var k in coursesOccIds){
                coursesOccIds[k] = coursesOccIds[k].slice(0, coursesNum);
            }

            console.log('coursesOccIds');
            console.log(coursesOccIds);

            // Pour chaque présence on regarde les absents plus de coursesNum fois consécutives au cours des derniers cours et on les ajoute
            // stuAbs est un dictionnaire avec pour clé l'id de l'étudiant et pour valeur son tableau d'absences
            var stuAbs = {};
            var presences = DataMngr.read('studentPresences');
            presences = $filter('orderBy')(presences, 'studentId');
            for(var p =0; p < presences.length; p++){
                for(var u in coursesOccIds){
                    for(var v = 0; v < Math.min(coursesOccIds[u].length, coursesNum); v++){
                        if ((presences[p].courseOccId == coursesOccIds[u][v].id) && (!presences[p].present)){
                            if(stuAbs[presences[p].studentId]){
                                stuAbs[presences[p].studentId].push(coursesOccIds[u][v]);
                            } else {
                                stuAbs[presences[p].studentId] = [coursesOccIds[u][v]];
                            }
                            /*
                            lastAbs.push({
                                studentId : presences[p].studentId,
                                courseOcc : coursesOccIds[u][v]
                            });*/
                        }
                    }
                }
            }
            console.log('stuAbs');
            console.log(stuAbs);

            // on contruit un tableau [{studentId:val, courseOcc: val}] à partir des absences des élèves
            var lastAbs = [];
            for(var s in stuAbs){
                if(stuAbs[s].length >= coursesNum){
                    for(var a = 0; a < stuAbs[s].length; a++){
                        lastAbs.push({
                            studentId : s,
                            courseOcc : stuAbs[s][a]
                        });
                    }
                }
            }

            console.log('lastAbs intermédiaire');
            console.log(lastAbs);

            ret = [];
            // On complète les données
            var courses = DataMngr.read('courses');
            var students = DataMngr.read('students');
            for(var l =0; l < lastAbs.length; l++){
                lastAbs[l].student = CoreFactory.getObjectFromId(students, lastAbs[l].studentId);
                lastAbs[l].course = CoreFactory.getObjectFromId(courses, lastAbs[l].courseOcc.courseId);
            }

            // On trie
            lastAbs = $filter('orderBy')(lastAbs, ['course.label', 'courseOcc.date', 'student.id']);
            console.log('lastAbs final');
            console.log(lastAbs);

            return lastAbs;
        }
/*
        requestMailStudentListOld : function(){
            var ret;
            // Pour chaque cours on cherche les occurrences de cours les plus proches de la date actuelle:
            var coursesOccIds = {};

            // Pour chaque instance on cherche la date la plus proche dans le passé de la date actuelle
            var now = new Date();
            var coursesOcc = DataMngr.read('coursesOccurences');
            for(var i = 0; i < coursesOcc.length; i++){
                if(now - coursesOcc[i].date > 0){
                    if(coursesOccIds[coursesOcc[i].courseId]){
                        // Le candidat est plus récent
                        if(coursesOccIds[coursesOcc[i].courseId].date - coursesOcc[i].date < 0){
                            coursesOccIds[coursesOcc[i].courseId] = coursesOcc[i];
                        }
                    } else {
                        coursesOccIds[coursesOcc[i].courseId] = coursesOcc[i];
                    }
                }
            }
            console.log(coursesOccIds);

            // Pour chaque présence on regarde les absents et on les ajoute
            var lastAbs = [];
            var presences = DataMngr.read('studentPresences');
            for(var p =0; p < presences.length; p++){
                for(var u in coursesOccIds){
                    if ((presences[p].courseOccId == coursesOccIds[u].id) && (!presences[p].present)){
                        lastAbs.push({
                            studentId : presences[p].studentId,
                            courseOcc : coursesOccIds[u]
                        });
                    }
                }
            }

            console.log(lastAbs);

            ret = [];
            // On complète les données
            var courses = DataMngr.read('courses');
            var students = DataMngr.read('students');
            for(var l =0; l < lastAbs.length; l++){
                lastAbs[l].student = CoreFactory.getObjectFromId(students, lastAbs[l].studentId);
                lastAbs[l].course = CoreFactory.getObjectFromId(courses, lastAbs[l].courseOcc.courseId);
            }
            console.log(lastAbs);

            return lastAbs;
        }
*/
    };
    return factory;
}])

.controller('PresenceCtrl', ['$scope', '$filter', 'Tools', 'DataMngr', 'CoreDataFactory', 'PresenceFactory', 'CoreFactory', function PresenceCtrl($scope, $filter, Tools, DataMngr, CoreDataFactory, PresenceFactory, CoreFactory) {
    $scope.currWeek = Tools.getWeekNumber(new Date())[2];

    $scope.getColLabel = function(aDate){
        return $filter('date')(aDate, 'dd/MM');
        //return Tools.getWeekNumber(aDate)[2];
    };
    $scope.getWeekNum = function(aDate){
        return Tools.getWeekNumber(aDate)[2];
    };
    $scope.isCloseToCurWeek = function(weekNum) {
        var ret = false;

        if ($scope.displayAllWeeks) {
            return true;
        }

        var currWeek = Tools.getWeekNumber(new Date())[2];
        if ((weekNum > currWeek - 3) && (weekNum < currWeek + 2)) {
            ret = true;
        }
        return ret;
    };

    $scope.uiMessages = DataMngr.uiMessagesLang[0].messages;
    var refresh = function(){
        $scope.presences = DataMngr.read('studentPresences');
        $scope.coursesOcc = DataMngr.read('coursesOccurences');
        $scope.closeCoursesOcc = [];
        for(var o = 0; o < $scope.coursesOcc.length; o++){
            // On retype les dates
            if(typeof($scope.coursesOcc[o].date) == 'string'){
                $scope.coursesOcc[o].date = new Date($scope.coursesOcc[o].date);
            }

            $scope.coursesOcc[o].week = $scope.getWeekNum($scope.coursesOcc[o].date);
            if($scope.isCloseToCurWeek($scope.coursesOcc[o].week)){
                $scope.closeCoursesOcc.push($scope.coursesOcc[o]);
            }
        }

        $scope.courses = DataMngr.read('courses');
        $scope.students = DataMngr.read('students');
        $scope.studentRegistrations = DataMngr.read('studentRegistrations');
    };

    var updateCloseCoursesOcc = function(){
        $scope.closeCoursesOcc = [];
        for(var o = 0; o < $scope.coursesOcc.length; o++){
            if($scope.isCloseToCurWeek($scope.coursesOcc[o].week)){
                $scope.closeCoursesOcc.push($scope.coursesOcc[o]);
            }
        }
        $scope.closeCoursesOcc = $filter('orderBy')($scope.closeCoursesOcc, 'date', false);
    };
    refresh();
    updateCloseCoursesOcc();


    // Initialisations (équivalent à ng-init mais dans le js)
    $scope.currCourse = $scope.courses[0];
    $scope.displayAllWeeks = false;

    /* Cela ne bouge pas (pas éditable dans cette vue) du coup on créé un objet   
    var getSudentCourses = function(){
        console.log('getSudentCourse');
        var ret = [];
        for(var i =0; i < $scope.studentRegistrations.length; i++){
            var a = CoreFactory.getObjectFromId($scope.students, $scope.studentRegistrations[i].studentId);
            var b = CoreFactory.getObjectFromId($scope.courses, $scope.studentRegistrations[i].courseId);
            if(a && b){
                var tmp = {
                    student: a,
                    course: b
                };
                ret.push(tmp);
            }
        }
        console.log(ret);
        return ret;
    };*/

    $scope.studentCourses = CoreDataFactory.getSudentCourses();

    $scope.getStudentPresence = CoreDataFactory.getStudentPresence;

    $scope.popoverText = function(courseOcc){
        var txt ='';
        if(null == $scope.currCourse){
            var course = CoreFactory.getObjectFromId($scope.courses, courseOcc.courseId);
            if(course){
                txt += course.label + ' ';
            }
        } 
        txt += $filter('date')(courseOcc.date,'dd-MM-yyyy HH:mm');
        return txt;
    };

    $scope.isCurrCourse = function(studentCourse){
        if($scope.currCourse){
            return (studentCourse.course.id == $scope.currCourse.id);
        } else {
            return true;
        }
    };

    $scope.changeDispAllWeeks = function(){
        $scope.displayAllWeeks = !$scope.displayAllWeeks;
        updateCloseCoursesOcc();
    };
    $scope.sendMail = function(){
        var mail = PresenceFactory.buildMail();
        Tools.sendMail(mail);
    };
    $scope.$on('PERIOD_CHANGE', function(evt){
        console.log('PERIOD_CHANGE dans presence');
        console.log(evt);
    });

    $scope.changed = function(){
        DataMngr.write('studentPresences', $scope.presences);
    };

    $scope.setCurCourse = function(course){
        $scope.currCourse = course;        
    };
    var popMailPrms = function(c){
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
// TODO: fenêtre de saisie des paramètres de contruction de mail (liste des cours ?)
    var popupCtrl = function () {
        $scope.
        $scope.ok = function () {
            popup.close('close');
        };
        $scope.cancel = function () {
            popup.close('cancel');
        };
    };
    var openModal = function (scope, size, callback) {
        popup = $modal.open({
            templateUrl: 'presence/mailprms.tpl.html',
            restrict: 'EA',
            controller: popupCtrl,
            size: size,
            resolve: {
                items: function () {
                   // mbBaseFunc.resize('main');
                    return scope.items;
                }
            },
            backdrop: true
        });

        popup.opened.then(function () {
        });
        if (callback) {
            popup.result.then(callback, function () {
                if (callback) {
                    callback();
                }
            });
        }
        return popup;
    };

}])
;