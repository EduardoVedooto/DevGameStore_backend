const cardSanitization = data => {
  const { name } = data;
  return {
    ...data,
    name: name.split(" ").filter(w => w).join(" ")
  }
}

export default cardSanitization;