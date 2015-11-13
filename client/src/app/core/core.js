
/*
        Est responsable de la cohérence et du contenu des données mais pas de la sauvegarde.
*/
angular.module('ngPresence.core', [
    'ui.router',
    'ui.bootstrap',
    'DataModule'
])
//On force l'injection de $modalInstance car sinon ça ne passe pas la minification.
.factory('CoreFactory', ['$filter', '$modal', 'Tools', 'DataMngr', function CoreFactory($filter, $modal, Tools, DataMngr){

    var factory = {

        openModal: function (scope, size, callback) {
            var popupCtrl = function ($scope) {
                $scope.ok = function () {
                    popup.close('close');
                };
                $scope.cancel = function () {
                    popup.close('cancel');
                };
            };

            popup = $modal.open({
                templateUrl: 'core/confirm.tpl.html',
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
        },

        /*
        openModalOld : function (scope, size) {
            var modalInstance = $modal.open({
                templateUrl: 'core/confirm.tpl.html',
                controller: function($scope, $modalInstance){
                    $scope.ok = function () {
                        $modalInstance.close('confirm');
                    };

                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                },
                size: size,
                resolve: {
                    items: function () {
                        return scope.items;
                    }
                }
            });
            return modalInstance;
        },*/

        getObjectFromId : function(source, id){
        // get course Id from course occurence id
            for(var i = 0; i < source.length; i++){
                if(source[i].id == id){
                    return source[i];
                }
            }
            return undefined;
        },

        getObjectFromKeys : function(source, keyValues){
        // get course Id from course occurence id
            for(var i = 0; i < source.length; i++){
                var equalsVal = true;
                for(var j in keyValues){
                    if(source[i][j] != keyValues[j]){
                        return source[i];
                    }
                }
            }
            return undefined;
        }
    };
    return factory;
}])

.factory('CoreDataFactory', ['$filter', 'Tools', 'DataMngr', 'CoreFactory', function CoreDataFactory($filter, Tools, DataMngr, CoreFactory){

    var factory = {
        // CRUD 
        getList : function(type){
            return DataMngr.read(type);
        },
        // Student
        deleteStudent : function(student){
            DataMngr.deleteItem('students', student);
            factory.cleanDataFromStudents();
            return DataMngr.read('students');
        },
        updateStudent : function(student){
            DataMngr.writeItem('students', student);
            return DataMngr.read('students');
        },
        // Cours
        deleteCourse : function(course){
            DataMngr.deleteItem('courses', course);
            factory.cleanDataFromCourses();
            return DataMngr.read('courses');
        },
        updateCourse : function(course){
            DataMngr.writeItem('courses', course);
            return DataMngr.read('courses');
        },
        // Occurrences de cours
        updateCourseOcc : function(courseOcc){
            DataMngr.writeItem('coursesOccurences', courseOcc);
            return DataMngr.read('coursesOccurences');
        },
        deleteCourseOcc : function(courseOcc){
            DataMngr.deleteItem('coursesOccurences', courseOcc);
            factory.cleanPresencesFromCourseOcc();
            return DataMngr.read('coursesOccurences');
        },
        // Niveaux (Level)
        updateLevel : function(level){
            DataMngr.writeItem('levels', level);
            return DataMngr.read('levels');
        },
        deleteLevel : function(level){
            DataMngr.deleteItem('levels', level);
            return DataMngr.read('levels');
        },
        // Incsription (registration)
        updateRegistration : function(registration){
            DataMngr.writeItem('studentRegistrations', registration);
            factory.updatePresences(false);
            return DataMngr.read('studentRegistrations');
        },
        deleteRegistration : function(registration){
            DataMngr.deleteAssociation('studentRegistrations', ['studentId', 'courseId'], registration);
            factory.cleanPresencesFromRegistrations();
            return DataMngr.read('studentRegistrations');
        },


        // Fonctions liées au modèle de données (pourraient être privées)
        getSudentCourses : function(){
            var students = DataMngr.read('students');
            var courses = DataMngr.read('courses');
            var studentRegistrations = DataMngr.read('studentRegistrations');
            var ret = [];
            for(var i =0; i < studentRegistrations.length; i++){
                var a = CoreFactory.getObjectFromId(students, studentRegistrations[i].studentId);
                var b = CoreFactory.getObjectFromId(courses, studentRegistrations[i].courseId);
                if(a && b){
                    var tmp = {
                        student: a,
                        course: b
                    };
                    ret.push(tmp);
                }
            }
            ret = $filter('orderBy')(ret, 'student.lastname');
            return ret;
        },

        cleanPresencesFromCourseOcc: function(){
            var studentPresences = DataMngr.read('studentPresences');
            var coursesOccurences = DataMngr.read('coursesOccurences');
            var newStudentPresences = [];

            for(var i = 0; i < studentPresences.length; i++){
                if(CoreFactory.getObjectFromId(coursesOccurences, studentPresences[i].courseOccId)){
                    newStudentPresences.push(angular.copy(studentPresences[i]));
                }
            }
            DataMngr.write('studentPresences', newStudentPresences);
            console.log(DataMngr.read('studentPresences'));
        },

        cleanPresencesFromRegistrations: function(){
            var studentPresences = DataMngr.read('studentPresences');
            var studentRegistrations = DataMngr.read('studentRegistrations');

            // nettoie les présences
            var newStudentPresences = [];
            for(var i = 0; i < studentPresences.length; i++){
                var reg = CoreFactory.getObjectFromKeys(studentRegistrations, {'studentId' : studentPresences[i].studentId, 'courseId' : studentPresences[i].courseId});
                if(reg){
                    newStudentPresences.push(studentPresences[i]);
                }
            }
            
            DataMngr.write('studentPresences', newStudentPresences);
            console.log(DataMngr.read('studentPresences'));
        },
        // Supprime: inscription et présences
        cleanDataFromStudents: function(){
            var students = DataMngr.read('students');
            var studentPresences = DataMngr.read('studentPresences');
            var studentRegistrations = DataMngr.read('studentRegistrations');

            // nettoie les présences
            var newStudentPresences = [];
            for(var i = 0; i < studentPresences.length; i++){
                if(CoreFactory.getObjectFromId(students, studentPresences[i].studentId)){
                    newStudentPresences.push(studentPresences[i]);
                }
            }
            DataMngr.write('studentPresences', newStudentPresences);

            // nettoie les inscriptions
            var newStudentRegistrations = [];
            for(var j = 0; j < studentRegistrations.length; j++){
                if(CoreFactory.getObjectFromId(students, studentRegistrations[j].studentId)){
                    newStudentRegistrations.push(studentRegistrations[j]);
                }
            }
            DataMngr.write('studentRegistrations', newStudentRegistrations);
        },
        // Supprime présence, inscription et occurences de cours
        cleanDataFromCourses: function(){
            var courses = DataMngr.read('courses');
            var coursesOccurences = DataMngr.read('coursesOccurences');
            var studentPresences = DataMngr.read('studentPresences');
            var studentRegistrations = DataMngr.read('studentRegistrations');

            // nettoie les présences
            var newStudentPresences = [];
            for(var i = 0; i < studentPresences.length; i++){
                // On récupère d'abord le cours via l'occurence
                var co = CoreFactory.getObjectFromId(coursesOccurences, studentPresences[i].courseOccId);
                if ((co) && (CoreFactory.getObjectFromId(courses, co.courseId))){
                    newStudentPresences.push(studentPresences[i]);
                }
            }
            DataMngr.write('studentPresences', newStudentPresences);

            // nettoie les inscriptions
            var newStudentRegistrations = [];
            for(var j = 0; j < studentRegistrations.length; j++){
                if(CoreFactory.getObjectFromId(courses, studentRegistrations[j].courseId)){
                    newStudentRegistrations.push(studentRegistrations[j]);
                }
            }
            DataMngr.write('studentRegistrations', newStudentRegistrations);

            // nettoie les occurences de cours
            var newCoursesOccurences = [];
            for(var k = 0; k < coursesOccurences.length; k++){
                if(CoreFactory.getObjectFromId(courses, coursesOccurences[k].courseId)){
                    newCoursesOccurences.push(coursesOccurences[k]);
                }
            }
            DataMngr.write('coursesOccurences', newCoursesOccurences);

        },

        // Supprime présence et occurences de cours
        cleanDataFromSchedules: function(){
            console.log("xxxxxxxxxxxxxxxxxx not implemented xxxxxxxxxxxxxxxxxxxxxxx");
        },
        isRegistred : function(studentId, courseId){
            var studentRegistrations = DataMngr.read('studentRegistrations');
            for(var l = 0; l < studentRegistrations.length; l++){
                if ((studentRegistrations[l].studentId == studentId) &&
                    (studentRegistrations[l].courseId == courseId)){
                    return true;
                }
            }
            return false;
        },

        getStudentPresence : function(studentId, courseOcc){
            // Se base sur le data manager plutôt que de tout recharger à chaque fois
            var studentPresences = DataMngr.read('studentPresences');
            // console.log("studentId: "+studentId+", courseId: "+courseId+", weekNum: "+weekNum);
            for(var i =0; i < studentPresences.length; i++){
                if ((studentPresences[i].studentId == studentId) && (studentPresences[i].courseOccId == courseOcc.id)){
                    return studentPresences[i];
                }
            }
            return undefined;
        },

        updatePresences: function(reset, callback){
            console.log("Update presences starts at " + $filter('date')(new Date(), 'hh:mm:ss.sss'));
            
            // Génère les occurences de cours
            factory.generateCourseOcc(reset);

            // Génère les présences
            factory.generatePresenceFromCourseOcc(reset);

            console.log("Update presences ends at " + $filter('date')(new Date(), 'hh:mm:ss.sss'));
            
            // Callback
            if(callback){
                callback();
            }

        },
        generateCourseOcc: function(reset, futureOnly){
            console.log('generateCourseOcc(' + reset + ')');
            var periods = DataMngr.read('periods');
            var courses = DataMngr.read('courses');
            var studentPresences = DataMngr.read('studentPresences');
            var coursesOccurences = DataMngr.read('coursesOccurences');
            var now = new Date();
            var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            if (reset){
                    coursesOccurences = [];
                    studentPresences = [];
            }
            // Génère les occurences de cours
            for(var i = 0; i < periods.length; i++){
                    var startDay = periods[i].start;
                    // Buggy
                    var daysNum = Math.round( (periods[i].end - periods[i].start) / (24 * 60 * 60 *1000) ) + 1;
                    console.log('daysNum: ' + daysNum + ' periods[' + i + '].end: ' + periods[i].end + ' periods[' + i + '].start: ' + periods[i].start);
                    for(var d = 0; d < daysNum; d++){
                        var curDate = new Date(startDay.getFullYear(), startDay.getMonth(), startDay.getDate() + d, 12);
                        console.log('curDate: ' + curDate);
                        for(var j = 0; j < courses.length; j++){
                            console.log('d: '+d+', courses['+j+'].hour : ' + courses[j].hour + ', courses['+j+'].minute : ' + courses[j].minute);
                            var cDate = new Date(startDay.getFullYear(), startDay.getMonth(), startDay.getDate() + d, courses[j].hour, courses[j].minute);
                            console.log('cDate: ' + cDate);
                            if(courses[j].day == curDate.getDay() &&  // Le cours est ce jour
                                 (reset || (today - curDate < 0) || !futureOnly) &&  // On efface tout ou l'occurence de cours est dans le futur
                                 !factory.existsCourseOcc({courseId: courses[j].id, date: cDate})){   

                                coursesOccurences.push(
                                    {
                                        "id": coursesOccurences.length,
                                        "courseId": courses[j].id,
                                        "date": cDate
                                    }
                                );
                            console.log('occurence added for course ' + courses[j].id);
                            }
                        } 
                    }
            }
            DataMngr.write('coursesOccurences', coursesOccurences);
        },
        existsCourseOcc: function(courseOcc){
            var ret = false;
            var coursesOccurences = DataMngr.read('coursesOccurences');
            for(var i = 0; i < coursesOccurences.length; i++){
                if(typeof coursesOccurences[i].date == 'string'){ // à mettre dans le DataMng.read non ?
                    coursesOccurences[i].date = new Date(coursesOccurences[i].date);
                }
                if (coursesOccurences[i].courseId == courseOcc.courseId && 
                    coursesOccurences[i].date.getFullYear() == courseOcc.date.getFullYear() &&
                    coursesOccurences[i].date.getMonth() == courseOcc.date.getMonth() &&
                    coursesOccurences[i].date.getDate() == courseOcc.date.getDate() &&
                    coursesOccurences[i].date.getHours() == courseOcc.date.getHours())
                    {
                        ret = true;
                    }
            }
            return ret;
        },
        generatePresenceFromCourseOcc: function(reset){
            var students = DataMngr.read('students');
            var studentPresences = DataMngr.read('studentPresences');
            var coursesOccurences = DataMngr.read('coursesOccurences');
            var today = new Date();
            for(var i=0; i < coursesOccurences.length; i++){
                for(var j=0; j < students.length; j++){
                    if(factory.isRegistred(students[j].id, coursesOccurences[i].courseId)){
                        //var currPresence = factory.getPresence(students[j].id, coursesOccurences[i].id);
                        var currPresence = factory.getStudentPresence(students[j].id, coursesOccurences[i]);

                        if(null == currPresence){
                            studentPresences.push({
                            'studentId': students[j].id,
                            'courseOccId': coursesOccurences[i].id,
                            'present': undefined});
                        } else if(reset){
                            currPresence.present = undefined;
                        }
                    }
                }
            }
            DataMngr.write('studentPresences', studentPresences);
        },

        handleEvents : function(scope){
            scope.$on('COURSEOCC_REMOVE', function(evt, args){
                console.log('remove presences due to course occurence change');
                factory.cleanPresencesFromCourseOcc();
            });
            scope.$on('REGISTRATION_REMOVE', function(evt, args){
                console.log('remove presences due to course occurence change');
                factory.cleanPresencesFromRegistrations();
            });            
            scope.$on('STUDENT_REMOVE', function(evt, args){
                console.log('remove presences due to course occurence change');
                factory.cleanDataFromStudents();
            });            
            scope.$on('COURSE_REMOVE', function(evt, args){
                console.log('remove presences due to course occurence change');
                factory.cleanDataFromCourses();
            });            
            scope.$on('PERDIOD_REMOVE', function(evt, args){
                console.log('remove presences due to course occurence change');
                factory.cleanDataFromSchedules();
            });

            scope.$on('COURSEOCC_CHANGE', function(evt, args){
                console.log('update presence due to course occurence change');
                factory.updatePresences(false);
            });
            scope.$on('REGISTRATION_CHANGE', function(evt, args){
                console.log('update presence due to registration change');
                factory.updatePresences(false);
            });
            scope.$on('PERIOD_CHANGE', function(evt, args){
                console.log('update presence due to period change');
                factory.updatePresences(false);
            });
        }
    };
    return factory;
}])
;