export const roles = {
    "admin": "Admin",
    "user": "Customer",
    "customer": "Customer",
    "manager": "Hub Manager",
    "regionalmanager": "Regional Manager",
    "rider": "Courier",
    "courier": "Courier",
    "superadmin": "Super Admin"
}

export const roleRoutes = {
    null: "/",
    undefined: "/",
    "user": "/customer",
    "customer": "/customer",
    "rider": "/courier",
    "courier": "/courier",
    "hub": "/hub",
    "manager": "/admin",
    "regionalmanager": "/admin",
    "admin": "/admin",
    "superadmin": "/admin"
}