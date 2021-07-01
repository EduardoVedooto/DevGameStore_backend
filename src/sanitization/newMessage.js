const messageSanitization = data => {
    const { name, email } = data;
    return {
      ...data,
      email: email.trim()
    }
  }
  
  export default messageSanitization;