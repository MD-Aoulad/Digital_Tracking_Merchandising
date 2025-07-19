# 🔑 **ADMIN LOGIN GUIDE**
## Digital Tracking Merchandising Platform

---

## ✅ **ADMIN LOGIN SUCCESSFULLY CONFIGURED**

Your admin account is now ready to use!

---

## 📋 **ADMIN CREDENTIALS**

| Field | Value |
|-------|-------|
| **Email** | `admin@company.com` |
| **Password** | `password` |
| **Role** | `admin` |
| **Permissions** | All permissions (`*`) |

---

## 🌐 **ACCESS POINTS**

### **Direct Auth Service (Recommended for testing)**
```bash
curl -X POST http://localhost:3001/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"password"}'
```

### **Through API Gateway**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"password"}'
```

### **Web Application**
- **Frontend**: http://localhost:3000
- **Mobile App**: http://localhost:3002

---

## 🔧 **LOGIN RESPONSE**

When you successfully login, you'll receive:

```json
{
  "message": "Login successful",
  "user": {
    "id": "cb3e91ee-3a4e-4266-89e2-ea61f8ebe79a",
    "email": "admin@company.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin",
    "permissions": ["*"]
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "24h"
}
```

---

## 🔐 **USING THE TOKEN**

After login, use the token for authenticated requests:

```bash
# Example: Get user profile
curl -X GET http://localhost:8080/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🛠️ **TROUBLESHOOTING**

### **If login fails:**
1. **Check service status**: `docker ps`
2. **Check auth service logs**: `docker logs digital_tracking_merchandising-auth-service-1`
3. **Reset admin user**: 
   ```bash
   docker exec digital_tracking_merchandising-auth-service-1 curl -X POST http://localhost:3001/admin/setup
   ```

### **If API Gateway doesn't work:**
- Try direct auth service access at `http://localhost:3001`
- Check API Gateway logs: `docker logs digital_tracking_merchandising-api-gateway-1`

---

## 🎯 **NEXT STEPS**

1. **Test the login** using the credentials above
2. **Access the web application** at http://localhost:3000
3. **Explore the API endpoints** using the admin token
4. **Create additional users** through the registration endpoint

---

## 📞 **SUPPORT**

If you encounter any issues:
- Check the service logs
- Verify all containers are running: `docker ps`
- Ensure database schemas are applied
- Contact the development team

---

**🎉 You're now ready to use the Digital Tracking Merchandising Platform as an admin!** 