# App de Finanzas Personales - Especificación Técnica

---

## 1. Descripción General

Esta aplicación tiene como objetivo ayudar a los usuarios a llevar un control efectivo de sus finanzas personales. Permitirá registrar ingresos, gastos, metas de ahorro y ofrecerá visualizaciones mensuales y anuales para facilitar la toma de decisiones financieras informadas.

La aplicación será responsive, diseñada principalmente para dispositivos móviles, pero con buen soporte para escritorio. El proyecto será fullstack con el stack MERN: React (frontend), Node.js + Express (backend), y MongoDB.

---

## 2. Requisitos Funcionales

- Registro, inicio de sesión y autenticación segura de usuarios (email y contraseña).
- Verificación de email con token JWT expirable (1 hora).
- CRUD para ingresos y gastos.
- Soporte para dividir gastos en cuotas y ajustar pagos mes a mes.
- Visualización de movimientos y balances por mes y año.
- Creación y edición de metas de ahorro.
- Gestión de categorías y subcategorías (un nivel de subcategorías).
- Asignación múltiple de categorías a una transacción.
- Filtros por categoría, fecha y tipo (ingreso/gasto).
- Validaciones estrictas de montos y datos.
- Control de edición para limitar cambios en datos históricos.
- Exportación básica (CSV, PDF en versiones futuras).
- Panel privado para usuarios y rol admin para soporte.
- Limitación de peticiones por minuto (rate limiting).

---

## 3. Gestión de Cuotas

- Gastos divididos en cuotas reflejados mensualmente hasta completar.
- Ejemplo: gasto con 5 cuotas iniciando marzo se refleja de marzo a julio.
- Ajustes por pagos adelantados o atrasados con actualización automática.
- Balance mensual refleja el estado real de pagos.

---

## 4. Arquitectura

```mermaid
graph TD
  FE[Frontend - React.js] -->|API calls| BE[Backend - Node.js/Express]
  BE --> DB[MongoDB Atlas]
  BE --> Auth[JWT Authentication]
  BE --> Email[Servicio Email (SendGrid/Mailgun)]
  BE --> Logs[Morgan + Rate Limiting]
  FE --> Mobile[App móvil (futuro) - React Native]
  BE --> BudgetLogic[Motor de Reglas de Presupuesto y Metas]
  BE --> Cuotas[Control de Cuotas]
Separación clara de ambientes con archivos .env.

Middleware para logs y limitación de peticiones.

JWT para autenticación y autorización.

Servicios externos para email.

5. Pruebas Automatizadas
Unitarias con Jest y Vitest.

Integración con Supertest para API.

Validación de esquemas con zod.

GitHub Actions para CI/CD.

Bloqueo de merge si tests fallan.

Plan futuro para e2e con Playwright o Cypress.

6. Estrategia de Ramas en Git
main: código estable para producción.

dev: integración y desarrollo.

feature/<nombre>: nuevas funcionalidades.

bugfix/<nombre>: correcciones.

test/<nombre>: pruebas experimentales.

Ramas temporales se eliminan tras merge.

Uso de GitHub Projects para seguimiento y vinculación de tareas.

7. Priorización
Registro y autenticación.

Gestión básica de ingresos y gastos.

Control y división en cuotas.

Visualización mensual y balances.

Metas de ahorro.

Gestión de categorías.

Preparación para app móvil React Native.

8. Control de Versiones
Uso de Git y GitHub.

Issues con etiquetas (feature, bug, docs).

Pull requests con revisión obligatoria.

Seguimiento con GitHub Projects.

9. Plantillas para Issues y Pull Requests
Issue (Feature, Bug, Mejora)
## Título: [Descripción corta]
### Descripción
[Detalles de la tarea o problema]
### Tipo
- [ ] Feature
- [ ] Bug
- [ ] Mejora
- [ ] Documentación
### Prioridad
- [ ] Alta
- [ ] Media
- [ ] Baja
### Responsable
@usuario
### Checklist
- [ ] Paso 1
- [ ] Paso 2
- [ ] Paso 3

Pull Request

## Descripción
[Breve descripción de cambios]
## Tipo de cambio
- [ ] Nueva funcionalidad
- [ ] Corrección de error
- [ ] Mejora
- [ ] Documentación
## Checklist
- [ ] Código formateado
- [ ] Tests pasados
- [ ] Documentación actualizada
- [ ] Revisiones aprobadas
10. Esquemas de Base de Datos (Mongoose)

const mongoose = require('mongoose');
const { Schema } = mongoose;

// Usuario
const UserSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  roles: { type: [String], default: ['user'] },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationTokenExpires: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
});

// Categoría y Subcategoría
const CategorySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  parentCategoryId: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
  createdAt: { type: Date, default: Date.now },
});

// Transacción
const TransactionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true }, // ingresos +, gastos -
  date: { type: Date, required: true },
  categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  isRecurrent: { type: Boolean, default: false },
  recurrenceFrequency: { type: String, enum: ['monthly', 'yearly', null], default: null },
  installments: { type: Number, default: 1 },
  installmentsPaid: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// Presupuesto mensual
const BudgetSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  expectedIncome: { type: Number, default: 0 },
  expectedExpense: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// Meta de ahorro
const SavingGoalSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  monthlySavingGoal: { type: Number, required: true },
  currentSavedAmount: { type: Number, default: 0 },
  startDate: { type: Date, required: true },
  targetDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = {
  User: mongoose.model('User', UserSchema),
  Category: mongoose.model('Category', CategorySchema),
  Transaction: mongoose.model('Transaction', TransactionSchema),
  Budget: mongoose.model('Budget', BudgetSchema),
  SavingGoal: mongoose.model('SavingGoal', SavingGoalSchema),
};
11. Endpoints API Principales
Usuarios
POST /api/auth/register — Registro de usuario.

POST /api/auth/login — Inicio de sesión.

GET /api/auth/verify-email?token=... — Verificación de email.

POST /api/auth/forgot-password — Solicitar recuperación.

POST /api/auth/reset-password — Restablecer contraseña.

Categorías
GET /api/categories — Listar categorías.

POST /api/categories — Crear categoría/subcategoría.

PUT /api/categories/:id — Actualizar categoría.

DELETE /api/categories/:id — Eliminar categoría.

Transacciones
GET /api/transactions — Obtener transacciones (con filtros).

POST /api/transactions — Crear ingreso/gasto.

PUT /api/transactions/:id — Actualizar transacción.

DELETE /api/transactions/:id — Eliminar transacción.

Metas de Ahorro
GET /api/saving-goals

POST /api/saving-goals

PUT /api/saving-goals/:id

DELETE /api/saving-goals/:id

Presupuesto Mensual
GET /api/budgets/:year/:month

POST /api/budgets

12. Configuración de Entorno (.env) - Ejemplo

PORT=4000
MONGODB_URI=mongodb+srv://usuario:password@cluster0.mongodb.net/dbname
JWT_SECRET=tu_secreto_jwt
EMAIL_SERVICE_API_KEY=apikey_sendgrid_o_mailgun
EMAIL_FROM=no-reply@tudominio.com
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
NODE_ENV=development
13. Scripts Básicos
Backend

npm run dev   # Ejecuta servidor con nodemon
npm start     # Ejecuta servidor en producción
npm test      # Ejecuta tests
Frontend

npm run dev   # Ejecuta frontend en modo desarrollo
npm run build # Compila para producción
npm run preview # Previsualiza build
14. Seguridad y Privacidad
JWT con expiración y manejo seguro.

Contraseñas cifradas con bcrypt.

Sanitización y validación de inputs.

Rate limiting para evitar abusos.

Políticas de acceso por usuario y admin.

Prevención CSRF y XSS.

Variables sensibles en .env no versionadas.

Logs sin información sensible.

15. Roadmap de Desarrollo
Setup inicial, estructura, configuración.

Registro, login y autenticación.

CRUD para categorías y transacciones.

Gestión de cuotas y lógica de pagos.

Metas de ahorro y visualización.

Tests automatizados.

Seguridad y mejoras.

Preparación para producción y despliegue.

Planificación app móvil.

16. Roles (Para equipo pequeño)
Backend: API, lógica, DB, seguridad.

Frontend: UI, integración, formularios.

QA: tests y calidad.

DevOps: CI/CD y despliegue.

PO/Líder: gestión y documentación.

17. Referencias Útiles
React

Node.js

Express

MongoDB Atlas

Mongoose

JWT

bcrypt.js

Jest

GitHub Actions

Tailwind CSS

SendGrid API