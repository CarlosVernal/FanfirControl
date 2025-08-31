// Función utilitaria para validar usuario autenticado
export const validateAuthenticatedUser = (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    const error = new Error("No tienes permiso para realizar esta acción");
    error.status = 403;
    throw error;
  }
  return userId;
};

// Exportación por defecto para compatibilidad
export default validateAuthenticatedUser;

// Función alternativa que no lanza excepción (para casos especiales)
// export const getAuthenticatedUserId = (req, res) => {
//   const userId = req.user?.id;
//   if (!userId) {
//     res.status(403).json({ error: "No tienes permiso para realizar esta acción" });
//     return null;
//   }
//   return userId;
// };