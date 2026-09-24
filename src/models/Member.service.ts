import MemberModel from "../schema/Member.model";
import { LoginInput, Member, MemberInput, MemberUpdateInput } from "../libs/types/member";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { MemberStatus, MemberType } from "../libs/enums/member.enum";
import * as bcrypt from "bcryptjs";
import { shapeIntoMongooseObjectId } from "../libs/config";



class MemberService {
    private readonly memberModel;

    constructor() {
        // STEP 5: schema Model bilan bog'lanish
        this.memberModel = MemberModel;
    }

    /** SPA=========== */
    public async getBarber(): Promise<Member> {
        const result = await this.memberModel
            .findOne({ memberType: MemberType.BARBER })
            .lean() // plain JS objectga ogirib beradi documentni uni biz ozgartirsak boladi
            .exec();

        if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

        return result as unknown as Member;
    }

    public async signup(input: MemberInput): Promise<Member> {
        const salt = await bcrypt.genSalt();
        input.memberPassword = await bcrypt.hash(input.memberPassword, salt);

        try {
            const result = await this.memberModel.create(input);

            result.memberPassword = "";

            return result.toJSON() as unknown as Member;

        } catch (err: any) {
            console.error("Error, model:signup", err);
            if (err?.code === 11000)
                throw new Errors(HttpCode.BAD_REQUEST, Message.USED_NICK_PHONE);
            throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
        }
    }

    public async login(input: LoginInput): Promise<Member> {
        // TODO: Consider member status later 
        const member = await this.memberModel
            .findOne(
                // Find qilsin: Nick, kiribkelgan Nick va Status Delete bomagan bolsa login boladi
                { memberNick: input.memberNick, memberStatus: { $ne: MemberStatus.DELETE } },
                { memberNick: 1, memberPassword: 1, memberStatus: 1 }
            )
            .exec();

        if (!member) throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER_NICK);
        else if (member.memberStatus === MemberStatus.BLOCK) {
            throw new Errors(HttpCode.FORBIDDEN, Message.BLOCKED_USER)
        }

        const isMatch = await bcrypt.compare(input.memberPassword, member.memberPassword);

        if (!isMatch) {
            throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);
        }

        const result = await this.memberModel.findById(member._id).exec();
        return result?.toJSON() as unknown as Member;
    }

    public async getMemberDetail(member: Member): Promise<Member> {
        const memeberId = shapeIntoMongooseObjectId(member._id);
        const result = await this.memberModel
            .findOne({ _id: memeberId, memberStatus: MemberStatus.ACTIVE })
            .exec();
        if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND)
        return result.toJSON() as unknown as Member
    }

    public async updateMember(member: Member, input: MemberUpdateInput): Promise<Member> {
        const memberId = shapeIntoMongooseObjectId(member._id);
        const result = await this.memberModel
            .findOneAndUpdate({ _id: memberId }, input, { new: true }) // filter, update, yangilangan versiyasi
            .exec();
        if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);

        return result?.toJSON() as unknown as Member;
    }

    public async getTopUsers(): Promise<Member[]> {
        const result = await this.memberModel
            .find({
                memberStatus: MemberStatus.ACTIVE,
                memberPoints: { $gte: 1 },
            })
            .sort({ memberPoints: -1 })
            .limit(4)
            .exec();

        if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

        return result.map((item) => item.toJSON() as unknown as Member);
    }

    public async getMasters(): Promise<Member[]> {
        const result = await this.memberModel
            .find({
                memberType: MemberType.MASTER,
                memberStatus: MemberStatus.ACTIVE,
            })
            .sort({ createdAt: -1 })
            .lean() // plain JS objectga ogirib beradi
            .exec();

        if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

        return result as unknown as Member[];
    }


    /** BSSR============ */

    public async processSignup(input: MemberInput): Promise<Member> {
        const exist = await this.memberModel
            .findOne({ memberType: MemberType.BARBER })
            .lean()
            .exec();
        if (exist) throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);

        const salt = await bcrypt.genSalt();
        input.memberPassword = await bcrypt.hash(input.memberPassword, salt);

        try {
            const result = await this.memberModel.create(input);
            result.memberPassword = "";
            return result.toJSON() as unknown as Member;
        } catch (err: any) {
            console.error("Error, model:processSignup", err);
            if (err?.code === 11000)
                throw new Errors(HttpCode.BAD_REQUEST, Message.USED_NICK_PHONE);
            throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
        }
    }

    public async processLogin(input: LoginInput): Promise<Member> {
        const member = await this.memberModel
            .findOne(
                { memberNick: input.memberNick, memberType: MemberType.BARBER },
                { memberNick: 1, memberPassword: 1 }
            )
            .lean()
            .exec();

        if (!member) throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER_NICK);

        const isMatch = await bcrypt.compare(input.memberPassword, member.memberPassword);

        if (!isMatch) {
            throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);
        }

        const result = await this.memberModel.findById(member._id).exec();
        return result?.toJSON() as unknown as Member;
    }


    public async getUsers(): Promise<Member[]> {
        const result = await this.memberModel
            .find({ memberType: MemberType.USER })
            .exec()

        if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

        return result as unknown as Member[];
    }


    public async updateChosenUser(input: MemberUpdateInput): Promise<Member> {
        input._id = shapeIntoMongooseObjectId(input._id);
        const result = await this.memberModel
            .findByIdAndUpdate({ _id: input._id }, input, { new: true })
            .exec();
        if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);

        return result?.toJSON() as unknown as Member;

    }
}





export default MemberService;
