# API Table

Base URL: `http://localhost:3000/api`

| Resource | Method | Endpoint | Auth | Description |
|---|---|---|---|---|
| Auth | POST | `/auth/register` | No | Register new user |
| Auth | POST | `/auth/login` | No | Login and receive JWT token |
| Users | GET | `/users` | Admin | Get all users |
| Users | PUT | `/users/:id/password` | Self/Admin | Update user password |
| Users | DELETE | `/users/:id` | Self/Admin | Delete user |
| Recipes | GET | `/recipes?search=aaa&limit=5&page=2` | Optional | List recipes with text search and paging |
| Recipes | GET | `/recipes/:code` | Optional | Get recipe by code (private rules apply) |
| Recipes | GET | `/recipes/prep-time/:minutes` | Optional | List recipes up to prep time (public + own private when logged in) |
| Recipes | POST | `/recipes` | Registered/Admin | Create recipe |
| Recipes | PUT | `/recipes/:code` | Owner/Admin | Update recipe |
| Recipes | DELETE | `/recipes/:code` | Owner/Admin | Delete recipe |
| Categories | GET | `/categories` | No | Get all categories |
| Categories | GET | `/categories/with-recipes` | Optional | Get all categories with recipes (public + own private when logged in) |
| Categories | GET | `/categories/:identifier` | Optional | Get category by code or description with recipes (public + own private when logged in) |

## Error format

```json
{
  "error": {
    "message": "..."
  }
}
```
