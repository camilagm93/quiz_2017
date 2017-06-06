var express = require('express');
var router = express.Router();

var quizController = require('../controllers/quiz_controller');
var tipController = require('../controllers/tip_controller');
var userController = require('../controllers/user_controller');
var sessionController = require('../controllers/session_controller');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

// Pagina de creditos
router.get('/author', function(req, res, next) {
    res.render('author');
});


// Autoload de rutas que usen :quizId
router.param('quizId', quizController.load);
router.param('userId', userController.load);
router.param('tipId',  tipController.load);


// Definición de rutas de sesion
router.get('/session', sessionController.new);
router.post('/session', sessionController.create);
router.delete('/session', sessionController.destroy);

// Definición de rutas de /quizzes
router.get('/quizzes',                     quizController.index);
router.get('/quizzes/:quizId(\\d+)',       quizController.show);
router.get('/quizzes/:quizId(\\d+)/play',  quizController.play);
router.get('/quizzes/:quizId(\\d+)/check', quizController.check);
router.get('/quizzes/new', sessionController.loginRequired, quizController.new);
router.post('/quizzes', sessionController.loginRequired, quizController.create);
router.get('/quizzes/:quizId(\\d+)/tips/new', sessionController.loginRequired, tipController.new);
router.post('/quizzes/:quizId(\\d+)/tips', sessionController.loginRequired, tipController.create);
router.delete('/quizzes/:quizId(\\d+)/tips/:tipId(\\d+)', sessionController.loginRequired, tipController.destroy);
router.put('/quizzes/:quizId(\\d+)/tips/:tipId(\\d+)/accept', sessionController.loginRequired, quizController.adminOrAuthorRequired, tipController.accept);
router.get('/quizzes/:quizId(\\d+)/edit', sessionController.loginRequired, quizController.adminOrAuthorRequired, quizController.edit);
router.put('/quizzes/:quizId(\\d+)', sessionController.loginRequired, quizController.adminOrAuthorRequired, quizController.update);
router.delete('/quizzes/:quizId(\\d+)', sessionController.loginRequired, quizController.adminOrAuthorRequired, quizController.destroy);


// Definición de rutas de cuenta
router.get('/users',
    sessionController.loginRequired,
    userController.index);
router.get('/users/:userId(\\d+)',
    sessionController.loginRequired,
    userController.show);
router.get('/users/new',
    userController.new);
router.post('/users',
    userController.create);
router.get('/users/:userId(\\d+)/edit',
    sessionController.loginRequired,
    sessionController.adminOrMyselfRequired,
    userController.edit);
router.put('/users/:userId(\\d+)',
    sessionController.loginRequired,
    sessionController.adminOrMyselfRequired,
    userController.update);
router.delete('/users/:userId(\\d+)',
    sessionController.loginRequired,
    sessionController.adminOrMyselfRequired,
    userController.destroy);

router.get('/users/:userId(\\d+)/quizzes', quizController.index);     // ver las preguntas de un usuario


module.exports = router;
