const fs = require("fs");
module.exports = () => {
    if(process.env.prefix && process.env.token) return process.env;
    if(!fs.readdirSync(".").includes(".env")) {
        console.log(".env not found so creating new one! Please fill .env");
        fs.writeFileSync("./.env",
`prefix=!
guildId=SERVER ID HERE
channelId=CHANNEL ID HERE
categoryId=CATEGORY ID HERE
supportRoles=SUPPORT ROLES HERE (USE , TO SPLIT)
token=TOKEN HERE`);
        return process.exit();
    }
    const env = {};
    fs.readFileSync("./.env").toString().split("\n").forEach(i=> {
        let firstChar = "";
        for(let j=0;j<i.length;j++) {
            if (i.charAt(j) !== " " && !firstChar)
                firstChar = i.charAt(j);
        }
        if(firstChar !== "#")
            env[i.split("=")[0]] = i.split("=").slice(1).join("=").replace(/\r/g, "");
    });
    return env;
}