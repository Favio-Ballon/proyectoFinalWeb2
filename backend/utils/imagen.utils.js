module.exports = {
    uploadImage: (image, destino) => {

        //get image extension
        const extension = image.mimetype.split('/')[1];

        //name of time to save image
        nombre = Date.now();

        //set image path
        const path = __dirname + '/../public/images/' + destino + '/' + nombre + '.' + extension;

        //if destination folder does not exist, create it
        const fs = require('fs');
        if (!fs.existsSync(__dirname + '/../public/images/' + destino)) {
            fs.mkdirSync(__dirname + '/../public/images/' + destino);
        }

        image.mv(path, function (err) {
            if (err) {
                console.log(err);
                res.status(500).json({
                    msg: 'Error al subir la imagen'
                });
                return;
            }
        });

        return nombre + '.' + extension;
    }
}
