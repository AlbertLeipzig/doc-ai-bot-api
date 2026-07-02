import { createResponse } from "@albertleipzig/doc-ai-bot-utils";
import { VectorProfile } from "../models/index.js";
import { ESystemMessage } from "@albertleipzig/doc-ai-bot-types";
import { Conversation } from "../models/index.js";
import mongoose from "mongoose";
const _create = async (req, res, next) => {
    try {
        await VectorProfile.create(req.body);
        createResponse({ res, messageCode: ESystemMessage.CREATE_SUCCESS });
    }
    catch (e) {
        next(e);
    }
};
const _read = async (req, res, next) => {
    try {
        const vectorProfile = await VectorProfile.findById(req.params.id);
        vectorProfile
            ? createResponse({
                res,
                messageCode: ESystemMessage.READ_SUCCESS,
                data: vectorProfile,
            })
            : createResponse({ res, messageCode: ESystemMessage.NOT_FOUND });
    }
    catch (e) {
        next(e);
    }
};
const _readMany = async (req, res, next) => {
    try {
        const vectorProfiles = await VectorProfile.find();
        vectorProfiles.length > 0
            ? createResponse({
                res,
                messageCode: ESystemMessage.READ_SUCCESS,
                data: vectorProfiles,
            })
            : createResponse({ res, messageCode: ESystemMessage.READ_EMPTY_LIST });
    }
    catch (e) {
        next(e);
    }
};
const _delete = async (req, res, next) => {
    try {
        const vectorProfile = await VectorProfile.findByIdAndDelete(req.params.id);
        vectorProfile
            ? createResponse({ res, messageCode: ESystemMessage.DELETE_SUCCESS })
            : createResponse({ res, messageCode: ESystemMessage.NOT_FOUND });
    }
    catch (e) {
        next(e);
    }
};
const _deleteMany = async (req, res, next) => {
    try {
        await VectorProfile.deleteMany();
        createResponse({ res, messageCode: ESystemMessage.DELETE_SUCCESS });
    }
    catch (e) {
        next(e);
    }
};
const getVectorProfileList = async (req, res, next) => {
    try {
        const profiles = await VectorProfile.find().sort({ _id: -1 }).lean();
        profiles.length > 0
            ? createResponse({
                res,
                messageCode: ESystemMessage.READ_SUCCESS,
                data: profiles,
            })
            : createResponse({ res, messageCode: ESystemMessage.READ_EMPTY_LIST });
    }
    catch (e) {
        next(e);
    }
};
const _getConversationsWithMessages = async (req, res, next) => {
    try {
        const { id } = req.params;
        const _id = Array.isArray(id) ? id[0] : id;
        const result = await VectorProfile.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(_id) } },
            {
                $lookup: {
                    from: "conversations",
                    let: { profileIdStr: { $toString: "$_id" } },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$vectorProfileId", "$$profileIdStr"] },
                                        { $eq: ["$benchmark", true] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: "conversations",
                },
            },
            {
                $lookup: {
                    from: "messages",
                    let: { convIds: "$conversations._id" },
                    pipeline: [
                        { $match: { $expr: { $in: ["$conversationId", "$$convIds"] } } },
                        {
                            $project: {
                                role: 1,
                                content: 1,
                                createdAt: 1,
                                conversationId: 1,
                            },
                        },
                    ],
                    as: "allMessages",
                },
            },
            {
                $addFields: {
                    conversations: {
                        $map: {
                            input: "$conversations",
                            as: "conv",
                            in: {
                                $mergeObjects: [
                                    "$$conv",
                                    {
                                        messages: {
                                            $filter: {
                                                input: "$allMessages",
                                                as: "msg",
                                                cond: { $eq: ["$$msg.conversationId", "$$conv._id"] },
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                },
            },
            { $project: { allMessages: 0 } },
        ]);
        const vectorProfile = result[0];
        if (!vectorProfile) {
            return createResponse({ res, messageCode: ESystemMessage.NOT_FOUND });
        }
        if (vectorProfile.conversations.length === 0) {
            return createResponse({
                res,
                messageCode: ESystemMessage.READ_EMPTY_LIST,
            });
        }
        createResponse({
            res,
            messageCode: ESystemMessage.READ_SUCCESS,
            data: vectorProfile,
        });
    }
    catch (e) {
        next(e);
    }
};
export const vectorProfileController = {
    _getList: getVectorProfileList,
    _create,
    _delete,
    _deleteMany,
    _read,
    _readMany,
    _getConversationsWithMessages,
};
