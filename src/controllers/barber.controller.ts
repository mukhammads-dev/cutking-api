import { NextFunction, Request, Response } from "express";
import { T } from "../libs/types/common"
import MemberService from "../models/Member.service";
import { AdminRequest, LoginInput, MemberInput } from "../libs/types/member";
import { MemberType } from "../libs/enums/member.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";

const barberController: T = {};
const memberService = new MemberService();


barberController.goHome = (req: Request, res: Response) => {
    try {

        res.render("home");
    }
    catch (err) {
        console.log("Error, goHome:", err)
        res.redirect("/admin");
    }
};

barberController.getLogin = (req: Request, res: Response) => {
    try {
        console.log('getLogin')
        res.render("login");
    }
    catch (err) {
        console.log("Error, getLogin:", err)
        res.redirect("/admin");
    }
};

barberController.getSignup = (req: Request, res: Response) => {
    try {
        console.log('getSignup')
        res.render("signup");
    }
    catch (err) {
        console.log("Error, getSignup:", err)
        res.redirect("/admin");
    }
};


barberController.processSignup = async (req: AdminRequest, res: Response) => {
    try {
        console.log('processSignup')
        const file = req.file; // uploads.file ushlab oldik
        if (!file) throw new Errors(HttpCode.BAD_REQUEST, Message.SOMETHING_WENT_WRONG);

        const newMember: MemberInput = req.body;
        newMember.memberImage = file?.path.replace(/\\/g, "/"); // fille-imageni member-imagega joyladik

        newMember.memberType = MemberType.BARBER;

        const result = await memberService.processSignup(newMember);

        // AUTH
        req.session.member = result;
        req.session.save(function () {
            res.redirect("/admin/services/all");

        });

    }
    catch (err) {
        console.log("Error, processSignup:", err)
        const message =
            err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
        res.send(
            `<script>alert ("${message}"); window.location.replace('/admin/signup') </script>`);

    }
};

barberController.processLogin = async (req: AdminRequest, res: Response) => {
    try {
        console.log('processLogin')
        const input: LoginInput = req.body;

        const result = await memberService.processLogin(input);

        // AUTH
        req.session.member = result;
        req.session.save(function () {
            res.redirect("/admin/services/all");
        });

    }
    catch (err) {
        console.log("Error, processLogin:", err);
        const message =
            err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
        res.send(
            `<script>alert ("${message}"); window.location.replace('/admin/login') </script>`);
    }
};


barberController.logout = async (req: AdminRequest, res: Response) => {
    try {
        console.log('logout')
        req.session.destroy(function () {
            res.redirect("/admin")
        });
    }
    catch (err) {
        console.log("Error, logout:", err)
        res.redirect("/admin")
    }
};




barberController.veryfyBarbershop = (
    req: AdminRequest,
    res: Response,
    next: NextFunction
) => {
    // req.session ichidagi member BARBER bo'lishi shart
    if (req.session?.member?.memberType === MemberType.BARBER) {
        req.member = req.session.member; // type checking
        next();
    } else {
        const message = Message.NOT_AUTHENTICATED;

        // AJAX/API so'rovlar (masalan status-select fetch/axios) uchun JSON qaytaramiz,
        // aks holda frontend "muvaffaqiyatsiz" deb hato tashxis qo'yadi.
        const wantsJson =
            req.xhr ||
            req.headers.accept?.includes("application/json") ||
            req.headers["content-type"]?.includes("application/json");

        if (wantsJson) {
            res.status(HttpCode.UNAUTHORIZED).json({
                code: HttpCode.UNAUTHORIZED,
                message,
            });
        } else {
            res.send(
                `<script>alert("${message}"); window.location.replace('/admin/login');</script>`
            );
        }
    }
}

barberController.getUsers = async (req: Request, res: Response) => {
    try {
        console.log('getUsers')
        const result = await memberService.getUsers();

        res.render("users", { users: result });
    }
    catch (err) {
        console.log("Error, getUsers:", err);
        res.redirect("/admin");
    }
}


barberController.updateChosenUser = async (req: Request, res: Response) => {
    try {
        console.log('updateChosenUser')
        const result = await memberService.updateChosenUser(req.body);

        res.status(HttpCode.OK).json({ data: result });
    }
    catch (err) {
        console.log("Error, updateChosenUser:", err)
        if (err instanceof Errors) res.status(err.code).json(err)
        else res.status(Errors.standard.code).json(Errors.standard);
    }
};




export default barberController;