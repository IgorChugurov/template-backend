export const roles =  ["user", "admin", "moderator"];
export const initRolesData = {
    admin : {
        user : "crud",
        role: "crud",
        order : "crud",
        news : "crud",
        item : "crud",
        comment : "crud",
        product : "crud",
    },
    moderator : {
        user : "crud",
        role: "crud",
        order : "crud",
        news : "crud",
        item : "crud",
        comment : "crud",
        product : "crud",
    },
    user : {
        user : "UR",
        role: "",
        order : "CRUD",
        news : "r",
        item : "r",
        comment : "CrUD",
        product : "r",
    },
    notAuth : {
        user : "",
        role: "",
        order : "",
        news : "r",
        item : "r",
        comment : "r",
        product : "r",
    },

}