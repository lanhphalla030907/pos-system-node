module.exports ={
    config : {
        app_name: "POS_Phone",
        app_version: "1.0",
        image_path: "",
        db : {
            HOST : process.env.DB_HOST || "localhost",
            USER : process.env.DB_USER || "root",
            PASSWORD : process.env.DB_PASSWORD || "",
            DATABASE : process.env.DB_NAME || "node-backend",
            PORT: parseInt(process.env.DB_PORT) || 3307
        },
    },
}