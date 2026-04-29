import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactElement } from "react";
import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";

type User = {
  id: string;
  username: string;
  email: string;
  role: "admin" | "registered";
};

type Recipe = {
  _id: string;
  code: string;
  name: string;
  description: string;
  categoryCodes: string[];
  prepTimeMinutes: number;
  difficulty: number;
  isPrivate: boolean;
};

type RecipeListResponse = {
  data: Recipe[];
  total: number;
  page: number;
  totalPages: number;
};

const API_BASE = "http://localhost:3000/api";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState<User | null>(
    JSON.parse(localStorage.getItem("user") || "null")
  );

  const auth = useMemo(
    () => ({
      token,
      user,
      login: (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(newUser));
      },
      logout: () => {
        setToken("");
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      },
    }),
    [token, user]
  );

  return (
    <div className="layout">
      <header className="topbar">
        <div>
          <h1>Recipes</h1>
          <p>Modern client for your API</p>
        </div>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/recipes/new">New Recipe</Link>
          <Link to="/my-recipes">My Recipes</Link>
          {!auth.token ? <Link to="/auth">Login/Register</Link> : null}
          {auth.token ? <button onClick={auth.logout}>Logout</button> : null}
        </nav>
      </header>

      <main className="content">
        <Routes>
          <Route path="/" element={<HomePage token={auth.token} />} />
          <Route
            path="/auth"
            element={auth.token ? <Navigate to="/" /> : <AuthPage onLogin={auth.login} />}
          />
          <Route
            path="/recipes/new"
            element={
              <PrivateRoute token={auth.token}>
                <NewRecipePage token={auth.token} />
              </PrivateRoute>
            }
          />
          <Route
            path="/my-recipes"
            element={
              <PrivateRoute token={auth.token}>
                <MyRecipesPage token={auth.token} user={auth.user} />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

function PrivateRoute({ token, children }: { token: string; children: ReactElement }) {
  if (!token) return <Navigate to="/auth" replace />;
  return children;
}

function HomePage({ token }: { token: string }) {
  const [recipes, setRecipes] = useState<RecipeListResponse | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState<{ code: string; recipesCount: number }[]>([]);

  useEffect(() => {
    fetchRecipes();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function fetchRecipes() {
    const response = await fetch(`${API_BASE}/recipes?search=${encodeURIComponent(search)}&limit=8&page=${page}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = (await response.json()) as RecipeListResponse;
    setRecipes(data);
  }

  async function fetchCategories() {
    const response = await fetch(`${API_BASE}/categories`);
    const data = await response.json();
    setCategories(data);
  }

  return (
    <section>
      <div className="card">
        <h2>Browse Recipes</h2>
        <div className="row">
          <input
            placeholder="Search by name or description"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button onClick={() => fetchRecipes()}>Search</button>
        </div>
      </div>

      <div className="recipes-grid">
        {recipes?.data?.map((recipe) => (
          <article key={recipe._id} className="card recipe-card">
            <h3>{recipe.name}</h3>
            <p>{recipe.description}</p>
            <small>
              Code: {recipe.code} | Time: {recipe.prepTimeMinutes} min | Difficulty: {recipe.difficulty}
            </small>
            {recipe.isPrivate ? <span className="pill">Private</span> : <span className="pill public">Public</span>}
          </article>
        ))}
      </div>

      <div className="pagination">
        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          Prev
        </button>
        <span>Page {recipes?.page || 1}</span>
        <button
          disabled={Boolean(recipes && recipes.page >= recipes.totalPages)}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>

      <div className="card">
        <h2>Categories</h2>
        <div className="chips">
          {categories.map((cat) => (
            <span key={cat.code} className="chip">
              {cat.code} ({cat.recipesCount})
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function AuthPage({ onLogin }: { onLogin: (token: string, user: User) => void }) {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    setMessage(response.ok ? "Registration successful. You can login now." : data?.error?.message || "Register failed");
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data?.error?.message || "Login failed");
      return;
    }

    onLogin(data.token, data.user);
    navigate("/");
  }

  return (
    <section className="auth-grid">
      <form className="card form" onSubmit={handleRegister}>
        <h2>Register</h2>
        <input name="username" placeholder="Username" required />
        <input name="email" type="email" placeholder="Email" required />
        <input name="password" type="password" placeholder="Strong password" required />
        <input name="address" placeholder="Address" />
        <button type="submit">Create account</button>
      </form>

      <form className="card form" onSubmit={handleLogin}>
        <h2>Login</h2>
        <input name="email" type="email" placeholder="Email" required />
        <input name="password" type="password" placeholder="Password" required />
        <button type="submit">Login</button>
      </form>

      {message ? <p className="card notice">{message}</p> : null}
    </section>
  );
}

function NewRecipePage({ token }: { token: string }) {
  const [message, setMessage] = useState("");

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") || ""),
      description: String(formData.get("description") || ""),
      categoryCodes: String(formData.get("categoryCodes") || "")
        .split(",")
        .map((x) => x.trim().toUpperCase())
        .filter(Boolean),
      prepTimeMinutes: Number(formData.get("prepTimeMinutes")),
      difficulty: Number(formData.get("difficulty")),
      image: String(formData.get("image") || ""),
      layers: [
        {
          description: "Main Layer",
          ingredients: ["ingredient 1", "ingredient 2"],
        },
      ],
      isPrivate: formData.get("isPrivate") === "on",
    };

    const response = await fetch(`${API_BASE}/recipes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    setMessage(response.ok ? `Recipe created: ${data.code}` : data?.error?.message || "Create failed");
  }

  return (
    <section>
      <form className="card form" onSubmit={handleCreate}>
        <h2>Create Recipe</h2>
        <input name="name" placeholder="Recipe name" required />
        <textarea name="description" placeholder="Description" required />
        <input name="categoryCodes" placeholder="Codes separated by comma" required />
        <input name="prepTimeMinutes" type="number" min={1} placeholder="Prep time minutes" required />
        <input name="difficulty" type="number" min={1} max={5} placeholder="Difficulty 1-5" required />
        <input name="image" placeholder="Image URL" />
        <label className="checkline">
          <input name="isPrivate" type="checkbox" /> Private recipe
        </label>
        <button type="submit">Save Recipe</button>
      </form>
      {message ? <p className="card notice">{message}</p> : null}
    </section>
  );
}

function MyRecipesPage({ token, user }: { token: string; user: User | null }) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/recipes?limit=50&page=1`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data: RecipeListResponse) => {
        setRecipes((data.data || []).filter((x) => x.isPrivate || Boolean(user)));
      });
  }, [token, user]);

  return (
    <section className="card">
      <h2>My Visible Recipes</h2>
      <div className="recipes-grid">
        {recipes.map((recipe) => (
          <article key={recipe._id} className="recipe-card">
            <h3>{recipe.name}</h3>
            <p>{recipe.description}</p>
            <small>{recipe.code}</small>
          </article>
        ))}
      </div>
    </section>
  );
}

export default App;
