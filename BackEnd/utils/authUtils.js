// Función utilitaria para validar usuario autenticado
export const validateAuthenticatedUser = (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(403).json({ error: "No tienes permiso para realizar esta acción" });
    return null;
  }
  return userId;
};