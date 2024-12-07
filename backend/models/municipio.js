module.exports = (sequelize, Sequelize) =>{
    const Municipio = sequelize.define('municipio', {
        nombre: {
            type: Sequelize.STRING,
            allowNull: false
        },
        latitud: {
            type: Sequelize.FLOAT,
            allowNull: false
        },
        longitud: {
            type: Sequelize.FLOAT,
            allowNull: false
        }
    });
    return Municipio;
}