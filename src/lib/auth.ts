export interface User {
  name: string;
  email: string;
}

export function getUser(): User | null {
  const data = localStorage.getItem("rice_user");
  return data ? JSON.parse(data) : null;
}

export function login(email: string, password: string): User | null {
  const users = JSON.parse(localStorage.getItem("rice_users") || "[]");
  const user = users.find((u: any) => u.email === email && u.password === password);
  if (user) {
    const { password: _, ...safe } = user;
    localStorage.setItem("rice_user", JSON.stringify(safe));
    return safe;
  }
  return null;
}

export function register(name: string, email: string, password: string): User {
  const users = JSON.parse(localStorage.getItem("rice_users") || "[]");
  users.push({ name, email, password });
  localStorage.setItem("rice_users", JSON.stringify(users));
  const user = { name, email };
  localStorage.setItem("rice_user", JSON.stringify(user));
  return user;
}

export function logout() {
  localStorage.removeItem("rice_user");
}
