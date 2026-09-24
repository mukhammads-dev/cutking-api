import { NextFunction, Request, Response } from "express";
import { T } from "../libs/types/common"
import MemberService from "../models/Member.service";
import { ExtendedRequest, LoginInput, Member, MemberInput, MemberUpdateInput } from "../libs/types/member";
import Errors, { HttpCode, Message } from "../libs/Errors";
import AuthService from "../models/Auth.service";
import { AUTH_TIMER, COOKIE_OPTIONS } from "../libs/config";

// for users  REACT project 
const memberService = new MemberService();
const memberController: T = {};
const authService = new AuthService();

memberController.getBarber = async (req: Request, res: Response) => {
    try {
        console.log("getBarber");

        const result = await memberService.getBarber();

        res.status(HttpCode.OK).json(result);
    } catch (err) {
        console.log("Error, getBarber:", err);

        if (err instanceof Errors) {
            res.status(err.code).json(err);
        } else {
            res.status(Errors.standard.code).json(Errors.standard);
        }
    }
};

memberController.signup = async (req: Request, res: Response) => {
    try {
        console.log('signup')
        const input: MemberInput = req.body,
            result: Member = await memberService.signup(input),

            // STEP : member ma'lumotidan JWT token yaratdi
            token = await authService.createToken(result);

        // accessToken nomi bilan brauzer cookie ichiga joylaymiz
        res.cookie("accessToken", token, {
            ...COOKIE_OPTIONS,
            maxAge: AUTH_TIMER * 3600 * 1000,
        });
        // STEP 5: JSON qaytaradi — member va token ikkalasini
        res.status(HttpCode.CREATED).json({ member: result, accessToken: token });
    }
    catch (err) {
        console.log("Error, signup:", err)
        if (err instanceof Errors) res.status(err.code).json(err)
        else res.status(Errors.standard.code).json(Errors.standard);
    }
};

memberController.login = async (req: Request, res: Response) => {
    try {
        console.log('login')
        const input: LoginInput = req.body,
            result = await memberService.login(input),
            token = await authService.createToken(result)

        res.cookie("accessToken", token, {
            ...COOKIE_OPTIONS,
            maxAge: AUTH_TIMER * 3600 * 1000,
        });

        res.status(HttpCode.OK).json({ member: result, accessToken: token });
    }
    catch (err) {
        // STEP 9
        console.log("Error, login:", err)
        if (err instanceof Errors) res.status(err.code).json(err)
        else res.status(Errors.standard.code).json(Errors.standard);

    }
};

memberController.getMemberDetail = async (req: ExtendedRequest, res: Response) => {
    try {
        console.log("getMemberDetail");
        const result = await memberService.getMemberDetail(req.member)

        res.status(HttpCode.OK).json(result);

    } catch (err) {
        console.log("Error, getMemberDetail:", err)
        if (err instanceof Errors) res.status(err.code).json(err)
        else res.status(Errors.standard.code).json(Errors.standard);
    }
}

memberController.logout = (req: ExtendedRequest, res: Response) => {
    try {
        console.log("logout");
        res.clearCookie("accessToken", COOKIE_OPTIONS);
        res.status(HttpCode.OK).json({ logout: true });
    } catch (err) {
        console.log("Error, logout:", err)
        if (err instanceof Errors) res.status(err.code).json(err)
        else res.status(Errors.standard.code).json(Errors.standard);
    }
}

memberController.updateMember = async (req: ExtendedRequest, res: Response) => {
    try {
        console.log("updateMember");
        const input: MemberUpdateInput = req.body;
        if (req.file) input.memberImage = req.file.path.replace(/\\/g, "/");
        const result = await memberService.updateMember(req.member, input);

        res.status(HttpCode.OK).json(result);
    }
    catch (err) {
        console.log("Error, updateMember:", err)
        if (err instanceof Errors) res.status(err.code).json(err)
        else res.status(Errors.standard.code).json(Errors.standard);
    }
}

memberController.getTopUsers = async (req: Request, res: Response) => {
    try {
        console.log("getTopUsers");

        const result = await memberService.getTopUsers();

        res.status(HttpCode.OK).json(result);
    } catch (err) {
        console.log("Error, getTopUsers:", err);

        if (err instanceof Errors) {
            res.status(err.code).json(err);
        } else {
            res.status(Errors.standard.code).json(Errors.standard);
        }
    }
};

memberController.getMasters = async (req: Request, res: Response) => {
    try {
        console.log("getMasters");

        const result = await memberService.getMasters();

        res.status(HttpCode.OK).json(result);
    } catch (err) {
        console.log("Error, getMasters:", err);

        if (err instanceof Errors) {
            res.status(err.code).json(err);
        } else {
            res.status(Errors.standard.code).json(Errors.standard);
        }
    }
};
// credential checking strict 
memberController.veryfyAuth = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    let member = null; // token mavjud bolsa ozgartiramiz
    try {
        // STEP 1: cookie dan tokenni oladi
        const token = req.cookies["accessToken"]; // token mavjudmi checking
        // STEP 2: token bor bo'lsa → checkAuth ga uzatadi
        if (token) req.member = await authService.checkAuth(token);
        if (!req.member)
            throw new Errors(HttpCode.UNAUTHORIZED, Message.NOT_AUTHENTICATED);
        next()

    } catch (err) {
        console.log("Error, veryfyAuth:", err)
        if (err instanceof Errors) res.status(err.code).json(err)
        else res.status(Errors.standard.code).json(Errors.standard);
    }

};

memberController.retrieveAuth = async (
    req: ExtendedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = req.cookies["accessToken"];
        if (token) req.member = await authService.checkAuth(token);
        // STEP 2: member nomi bilan req ichiga joylab bersin mantigni

        next()
    } catch (err) {
        console.log("Error, retrieveAuth:", err)
        next()
    }

};



export default memberController;