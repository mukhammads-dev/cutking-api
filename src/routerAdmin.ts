import express from "express";
const routerAdmin = express.Router();
import barberController from "./controllers/barber.controller";
import makeUploader from "./libs/utils/uploader";
import serviceController from "./controllers/service.controller";
import masterController from "./controllers/master.controller";

/** Barber admin */

routerAdmin.get('/', barberController.goHome);

routerAdmin
    .get('/login', barberController.getLogin)
    .post('/login', barberController.processLogin);

routerAdmin
    .get('/signup', barberController.getSignup)
    .post('/signup', makeUploader("members").single("memberImage"),
        barberController.processSignup)

routerAdmin.get('/logout', barberController.logout);



/** Masters */
routerAdmin
    .get('/master/all',
        barberController.veryfyBarbershop,
        masterController.getAllMasters
    );
routerAdmin
    .get('/master/create', barberController.veryfyBarbershop, masterController.getMasterCreate)
    .post('/master/create',
        barberController.veryfyBarbershop,
        makeUploader("masters").single("memberImage"),
        masterController.createNewMaster,
    );
routerAdmin.post('/master/:id',
    barberController.veryfyBarbershop,
    masterController.updateChosenMaster,
);


/** Services */
routerAdmin
    .get('/services/all',
        barberController.veryfyBarbershop, // MD oraliq mantiq
        serviceController.getAllServices
    );
routerAdmin
    .get('/services/create', barberController.veryfyBarbershop, serviceController.getServiceCreate)
    .post('/services/create',
        barberController.veryfyBarbershop,
        makeUploader("cutting-services").array("serviceImages", 5),
        serviceController.createNewService,
    );
routerAdmin.post('/services/:id',
    barberController.veryfyBarbershop,
    serviceController.updateChosenService,
);


/** User */
routerAdmin.get(
    "/user/all",
    barberController.veryfyBarbershop,
    barberController.getUsers)

routerAdmin.post(
    "/user/edit",
    barberController.veryfyBarbershop,
    barberController.updateChosenUser,
)

export default routerAdmin;