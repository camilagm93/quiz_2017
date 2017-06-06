'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {

        return queryInterface.bulkInsert('Quizzes', [
            {
                question: 'Capital de Cuba',
                answer: 'La Habana',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                question: 'Capital de España',
                answer: 'Madrid',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                question: 'Capital de Alemania',
                answer: 'Berlin',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                question: 'Capital de Italia',
                answer: 'Milan',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
    },

    down: function (queryInterface, Sequelize) {

        return queryInterface.bulkDelete('Quizzes', null, {});
    }
};
