import "dotenv/config";

export const optionsSQLite = {
    client: process.env.SQLITE_CLIENT,
    connection: {
        filename: process.env.SQLITE_DB,
    },
    useNullAsDefault: true,
};
