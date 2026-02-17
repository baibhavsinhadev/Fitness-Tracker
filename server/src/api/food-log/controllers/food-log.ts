import { factories } from "@strapi/strapi";
import type { Context } from "koa";

export default factories.createCoreController(
    "api::food-log.food-log",
    ({ strapi }) => ({
        async create(ctx: Context) {
            const user = ctx.state.user;
            if (!user) return ctx.unauthorized("Login Required");

            const body = ctx.request.body?.data;
            if (!body) return ctx.badRequest("Missing data");

            const entry = await strapi.entityService.create("api::food-log.food-log", {
                data: {
                    ...body,
                    users_permissions_user: user.id,
                },
                populate: ["users_permissions_user"],
            });

            return entry;
        },

        async find(ctx: Context) {
            const user = ctx.state.user;
            if (!user) return ctx.unauthorized("Login Required");

            const result = await strapi.entityService.findMany("api::food-log.food-log", {
                filters: {
                    users_permissions_user: user.id,
                },
                sort: { createdAt: "desc" },
                populate: ["users_permissions_user"],
            });

            return result;
        },

        async findOne(ctx: Context) {
            const user = ctx.state.user;
            if (!user) return ctx.unauthorized("Login Required");

            const logId = Number(ctx.params.id);
            if (Number.isNaN(logId)) return ctx.badRequest("Invalid id");

            const results = await strapi.entityService.findMany("api::food-log.food-log", {
                filters: {
                    id: logId,
                    users_permissions_user: user.id,
                },
                populate: ["users_permissions_user"],
                limit: 1,
            });

            const result = results[0];

            if (!result) {
                return ctx.notFound("Food log not found");
            }

            return result;
        },

        async delete(ctx: Context) {
            const user = ctx.state.user;
            if (!user) return ctx.unauthorized("Login Required");

            const logId = Number(ctx.params.id);
            if (Number.isNaN(logId)) return ctx.badRequest("Invalid id");

            // ownership check
            const results = await strapi.entityService.findMany("api::food-log.food-log", {
                filters: {
                    id: logId,
                    users_permissions_user: user.id,
                },
                limit: 1,
            });

            const entry = results[0];
            if (!entry) return ctx.notFound("Food log not found");

            await strapi.entityService.delete("api::food-log.food-log", logId);

            return { ok: true };
        },
    })
);
