export const sendToken = (resp, user, message, statusCode = 200, userStatus) => {
  const token = user.getJWTToken();
  const options = {
    expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: false,
    samSite: "none",
  };

  const { fname, lname, email, phone, role, uid, createdAt, avatar, updatedAt, dob } = user

  if (userStatus?.status === "new") {
    resp.status(statusCode).json({
      message,
      "success": true
    })
  }
  else {
    resp.cookie("token", token, options)
    resp.status(statusCode).json({
      data: {
        fname, lname, email, phone, role, uid, createdAt, avatar, updatedAt, dob,
        "state": userStatus?.status && "active"
      },
      "success": true
    });
  }

};
