export const checkAccessCreate = async (req, res, next) => {
  /**
   * access for creating collection
   * */
  req.accessChar = "c";
  await checkAccess(req, res, next);
};
export const checkAccessRead = async (req, res, next) => {
  /**
   * access for reading collection
   * */
  req.accessChar = "r";
  await checkAccess(req, res, next);
};
export const checkAccessUpdate = async (req, res, next) => {
  /**
   * access for updating collection
   * */
  req.accessChar = "u";
  await checkAccess(req, res, next);
};
export const checkAccessDelete = async (req, res, next) => {
  /**
   * access for updating collection
   * */
  req.accessChar = "d";
  await checkAccess(req, res, next);
};

function checkAccessChar(req) {
  const { rolePermission, accessChar, userId, collectionName } = { ...req };
  /* если нет валидного токена , то можно только читать коллекции за исключением трех*/
  if (
    !userId &&
    (accessChar !== "r" ||
      collectionName === "user" ||
      collectionName === "order" ||
      collectionName === "role")
  ) {
    return false;
  }
  let i = rolePermission.indexOf(accessChar);
  if (i > -1) {
    return true;
  }
  /**
   * большая буква - только для владельцев контента
   * */
  if (userId) {
    i = rolePermission.indexOf(accessChar.toUpperCase());
    //const doc = await req.collection.findOne({_id: req.params.id})
    if (i > -1) {
      // todo
      //if( collectionName model has owner.prop){req.onlyForOwner = true;}
      return true;
    }
  }
}
async function checkAccess(req, res, next) {
  const collectionName = req.collectionName;
  const userId = req.userId;
  const User = req.User;
  const Role = req.Role;
  try {
    req.rolePermission = "";
    let user, roleName;
    if (userId) {
      user = await User.findById(userId).populate("role");
      console.log(user.role);
      req.user = user.toJSON();
    }
    if (
      user &&
      user.role &&
      user.role.rule &&
      typeof user.role.rule[collectionName] !== "undefined"
    ) {
      /* for debugging*/
      //req.rolePermission = initRolesData[user.role.name][collectionName];
      req.rolePermission = user.role.rule[collectionName];
      roleName = user.role.name;
    } else {
      /* проверка для неавторизованного */
      const role = await Role.findOne({ name: "notAuth" });
      if (role.rule && typeof role.rule[collectionName] !== "undefined") {
        req.rolePermission = role.rule[collectionName];
      } else {
        return res
          .status(403)
          .send({ message: "There is not permission data (notAuth) for this collection!" });
      }
      roleName = "notAuth";
    }

    //console.log(`role name - ${roleName}, RolePermission ${req.rolePermission}`)
    if (checkAccessChar(req)) {
      return next();
    }
    /**
     * Доступ запрещен
     * */
    return res.status(403).send({ message: "Required Role is absent (access denay)!" });
  } catch (err) {
    console.log(err);
    next(err);
  }
}
