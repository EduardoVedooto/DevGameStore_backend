const cardSanitization = data => {
  const { name, month, year } = data;
  return {
    ...data,
    name: name.split(" ").filter(w => w).join(" "),
    month: month.trim(),
    year: year.trim()
  }
}

export default cardSanitization;