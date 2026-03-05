export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validatePassword(password) {
  return password.length >= 6;
}

export function validateExpense(expense) {
  const { amount, category, date, description } = expense;
  return (
    amount > 0 &&
    category &&
    date &&
    description &&
    description.trim().length > 0
  );
}