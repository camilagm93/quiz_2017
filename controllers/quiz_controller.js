var models = require("../models");
var Sequelize = require('sequelize');

var paginate = require('../helpers/paginate').paginate;

// Autoload el quiz asociado a :quizId
exports.load = function (req, res, next, quizId) {

    models.Quiz.findById(quizId, {
        include: [
            models.Tip,
            {model: models.User, as: 'Author'}
        ]
    })
        .then(function (quiz) {

            if (quiz) {
                req.quiz = quiz;
                next();
            } else {
                throw new Error('No existe ningún quiz con id=' + quizId);
            }
        })
        .catch(function (error) {
            next(error);
        });
};


// GET /quizzes
exports.index = function (req, res, next) {

    var countOptions = {
        where: {}
    };

    var title = "Preguntas";

    // Busquedas:
    var search = req.query.search || '';
    if (search) {
        var search_like = "%" + search.replace(/ +/g,"%") + "%";

        countOptions.where.question = { $like: search_like };
    }

    // Si existe req.user, mostrar solo sus preguntas.
    if (req.user) {
        countOptions.where.AuthorId = req.user.id;
        title = "Preguntas de " + req.user.username;
    }

    models.Quiz.count(countOptions)
        .then(function (count) {

            var items_per_page = 10;


            var page = parseInt(req.query.page) || 1;


            res.locals.paginate_control = paginate(count, items_per_page, page, req.url);

            var findOptions = countOptions;

            findOptions.offset = items_per_page * (page - 1);
            findOptions.limit = items_per_page;
            findOptions.include = [{model: models.User, as: 'Author'}];

            return models.Quiz.findAll(findOptions);
        })
        .then(function (quizzes) {

            res.render('quizzes/index.ejs', {
                quizzes: quizzes,
                search: search,
                title: title
            });
        })
        .catch(function (error) {
            next(error);
        });
};



// GET /quizzes/:quizId
exports.show = function (req, res, next) {

    // Antes de renderizar quizzes/show con req.quiz,
    // necesitamos modificar req.quiz para que las tips
    // tengan el campo "username"

    var authorId2username = {};

    var allAuthorIdsToConsult = req.quiz.Tips.map(function (tip) {
        return tip.AuthorId
    });

    // https://stackoverflow.com/questions/1960473/unique-values-in-an-array
    var uniqueAuthorIdsToConsult = allAuthorIdsToConsult.filter(function(value, index, self){
        return self.indexOf(value) === index;
    });

    var consultPromises = uniqueAuthorIdsToConsult.map(function(AuthorId){
        return userController.getUsernameForAuthorId(AuthorId, authorId2username)
    });

    // modifyQuizTipsAddingUsername(req.quiz.Tips, authorId2username);

    Promise.all(consultPromises)
        .then(function(){

            req.quiz.Tips.forEach(function(tip){
                tip.username = authorId2username[tip.AuthorId.toString()];
            });

            res.render('quizzes/show', {quiz: req.quiz});
        });
};


// GET /quizzes/new
exports.new = function (req, res, next) {

    var quiz = {question: "", answer: ""};

    res.render('quizzes/new', {quiz: quiz});
};



// POST /quizzes/create
exports.create = function (req, res, next) {

    var authorId = req.session.user && req.session.user.id || 0;

    var quiz = models.Quiz.build({
        question: req.body.question,
        answer: req.body.answer,
        AuthorId: authorId
    });

    // guarda en DB los campos pregunta y respuesta de quiz
    quiz.save({fields: ["question", "answer", "AuthorId"]})
        .then(function (quiz) {
            req.flash('success', 'Quiz creado con éxito.');
            res.redirect('/quizzes/' + quiz.id);
        })
        .catch(Sequelize.ValidationError, function (error) {

            req.flash('error', 'Errores en el formulario:');
            for (var i in error.errors) {
                req.flash('error', error.errors[i].value);
            }

            res.render('quizzes/new', {quiz: quiz});
        })
        .catch(function (error) {
            req.flash('error', 'Error al crear un Quiz: ' + error.message);
            next(error);
        });
};


exports.adminOrAuthorRequired = function(req, res, next){

    var isAdmin  = req.session.user.isAdmin;
    var isAuthor = req.quiz.AuthorId === req.session.user.id;

    if (isAdmin || isAuthor) {
        next();
    } else {
        res.send(403);
    }
};


// GET /quizzes/:quizId/edit
exports.edit = function (req, res, next) {

    res.render('quizzes/edit', {quiz: req.quiz});
};


// PUT /quizzes/:quizId
exports.update = function (req, res, next) {

    req.quiz.question = req.body.question;
    req.quiz.answer = req.body.answer;

    req.quiz.save({fields: ["question", "answer"]})
        .then(function (quiz) {
            req.flash('success', 'Quiz editado con éxito.');
            res.redirect('/quizzes/' + req.quiz.id);
        })
        .catch(Sequelize.ValidationError, function (error) {

            req.flash('error', 'Errores en el formulario:');
            for (var i in error.errors) {
                req.flash('error', error.errors[i].value);
            }

            res.render('quizzes/edit', {quiz: req.quiz});
        })
        .catch(function (error) {
            req.flash('error', 'Error al editar el Quiz: ' + error.message);
            next(error);
        });
};


// DELETE /quizzes/:quizId
exports.destroy = function (req, res, next) {

    req.quiz.destroy()
    .then(function () {
        req.flash('success', 'Quiz borrado con éxito.');
        res.redirect('/quizzes');
    })
    .catch(function (error) {
        req.flash('error', 'Error al editar el Quiz: ' + error.message);
        next(error);
    });
};


// GET /quizzes/:quizId/play
exports.play = function (req, res, next) {

    var answer = req.query.answer || '';

    res.render('quizzes/play', {
        quiz: req.quiz,
        answer: answer
    });
};


// GET /quizzes/:quizId/check
exports.check = function (req, res, next) {

    var answer = req.query.answer || "";

    var result = answer.toLowerCase().trim() === req.quiz.answer.toLowerCase().trim();

    res.render('quizzes/result', {
        quiz: req.quiz,
        result: result,
        answer: answer
    });
};
