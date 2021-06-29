
const userSanitization = data => {
  const { name, email } = data;
  return {
    ...data,
    name: name.split(" ").filter(w => w).join(" "),
    email: email.trim(),
  }
}

export default userSanitization;