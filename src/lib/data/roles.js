export const roles = {
    "admin": "Admin",
    "user": "Customer",
    "customer": "Customer",
    "hubmanager": "Hub Manager",
    "manager": "Manager",
    "rider": "Courier",
    "courier": "Courier"
}

export const roleRoutes = {
    null: "/",
    undefined: "/",
    "user": "/customer",
    "customer": "/customer",
    "rider": "/courier",
    "courier": "/courier",
    "hub": "/hub",
    "hubmanager": "/hub",
    "manager": "/admin",
    "admin": "/admin",
    "superadmin": "/admin"
}