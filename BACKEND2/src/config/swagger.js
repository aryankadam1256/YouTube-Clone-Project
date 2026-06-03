import swaggerJsdoc from "swagger-jsdoc";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "VidFlow API",
            version: "1.0.0",
            description:
                "REST API for VidFlow — a full-stack video streaming platform with vector-based recommendations, Elasticsearch search, and JWT authentication.",
        },
        servers: [
            { url: "http://localhost:8000/api/v1", description: "Local development" },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
                cookieAuth: {
                    type: "apiKey",
                    in: "cookie",
                    name: "accessToken",
                },
            },
            schemas: {
                ApiResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean" },
                        statusCode: { type: "integer" },
                        message: { type: "string" },
                        data: { type: "object" },
                    },
                },
                ApiError: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: false },
                        statusCode: { type: "integer" },
                        message: { type: "string" },
                        errors: { type: "array", items: { type: "string" } },
                    },
                },
                User: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        username: { type: "string" },
                        fullname: { type: "string" },
                        email: { type: "string", format: "email" },
                        avatar: { type: "string", format: "uri" },
                        coverImage: { type: "string", format: "uri" },
                        createdAt: { type: "string", format: "date-time" },
                    },
                },
                Video: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        title: { type: "string" },
                        description: { type: "string" },
                        videoFile: { type: "string", format: "uri" },
                        thumbnail: { type: "string", format: "uri" },
                        duration: { type: "number" },
                        views: { type: "integer" },
                        isPublished: { type: "boolean" },
                        tags: { type: "array", items: { type: "string" } },
                        language: { type: "string" },
                        owner: { type: "string" },
                        createdAt: { type: "string", format: "date-time" },
                    },
                },
                Comment: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        comment: { type: "string" },
                        owner: { $ref: "#/components/schemas/User" },
                        video: { type: "string" },
                        createdAt: { type: "string", format: "date-time" },
                    },
                },
                Playlist: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        name: { type: "string" },
                        description: { type: "string" },
                        videos: { type: "array", items: { type: "string" } },
                        owner: { type: "string" },
                    },
                },
            },
        },
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
    },
    apis: ["./src/routes/*.js"],
};

export const swaggerSpec = swaggerJsdoc(options);
