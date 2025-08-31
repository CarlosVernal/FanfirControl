// Importar el modelo de Meta de Ahorro y utilidad de autenticación
import SavingGoal from "../models/SavingGoal.js";
import validateAuthenticatedUser from "../utils/authUtils.js";

// Controlador para crear una nueva meta de ahorro
// Valida los datos de entrada y crea una nueva meta asociada al usuario autenticado

export async function createSavingGoal(req, res, next) {
    try {
        const userId = validateAuthenticatedUser(req, res);

        // Extraer los datos de la meta de ahorro del cuerpo de la petición
        const {
            name,                   // Nombre de la meta (ej: "Vacaciones", "Auto nuevo")
            targetAmount,           // Cantidad objetivo a ahorrar
            monthlySavingGoal,      // Cantidad a ahorrar mensualmente
            currentSavedAmount,     // Cantidad ya ahorrada (opcional, por defecto 0)
            startDate,              // Fecha de inicio de la meta
            targetDate              // Fecha objetivo para completar la meta
        } = req.body;

        if (currentSavedAmount >= targetAmount) {
            return res.status(400).json({ error: "La cantidad ahorrada actual no puede ser mayor o igual a la meta" });
        }

        if (new Date(startDate) >= new Date(targetDate)) {
            return res.status(400).json({ error: "La fecha de inicio debe ser anterior a la fecha objetivo" });
        }

        if (monthlySavingGoal <= 0) {
            return res.status(400).json({ error: "La meta de ahorro mensual debe ser mayor a cero" });
        }

        if (currentSavedAmount < 0) {
            return res.status(400).json({ error: "La cantidad ahorrada actual no puede ser negativa" });
        }

        if (targetAmount <= 0) {
            return res.status(400).json({ error: "La meta de ahorro debe ser mayor a cero" });
        }

        if (monthlySavingGoal > targetAmount) {
            return res.status(400).json({ error: "La meta de ahorro mensual no puede ser mayor a la meta total" });
        }

        if (monthlySavingGoal > (targetAmount - currentSavedAmount)) {
            return res.status(400).json({ error: "La meta de ahorro mensual no puede ser mayor a la cantidad restante para alcanzar la meta" });
        }

        // Crear una nueva instancia de la meta de ahorro con los datos validados
        const savingGoal = new SavingGoal({
            userId,
            name: name.trim(),
            targetAmount,
            monthlySavingGoal,
            currentSavedAmount: currentSavedAmount || 0,
            startDate,
            targetDate,
        });

        const savedSavingGoal = await savingGoal.save();

        res.status(201).json(savedSavingGoal);
    } catch (error) {
        next(error);
    }
}

// Controlador para obtener todas las metas de ahorro del usuario
// Incluye paginación, filtros por estado y campos calculados
export async function getSavingGoals(req, res, next) {
    try {
        const userId = validateAuthenticatedUser(req, res);

        // Extraer parámetros de consulta con valores por defecto
        const {
            page = 1,           // Página actual (por defecto 1)
            limit = 20,         // Elementos por página (por defecto 20)
            status = "all"      // Filtro de estado: "all", "active", "completed"
        } = req.query;

        // Inicializar pipeline de agregación de MongoDB
        // Un pipeline es una serie de operaciones que se ejecutan secuencialmente
        let aggregationPipeline = [
            // Primer paso: filtrar solo las metas del usuario autenticado
            { $match: { userId } }
        ];

        // === FILTROS POR ESTADO ===
        // Agregar filtros adicionales según el estado solicitado
        if (status === "active") {
            // Metas activas: donde la cantidad ahorrada es menor que la meta
            aggregationPipeline.push({
                //simil del where en bases de datos sql
                $match: {
                    //less than: solo se agregan los valores menores que v1 < v2
                    $expr: { $lt: ["$currentSavedAmount", "$targetAmount"] }
                }
            });
        } else if (status === "completed") {
            // Metas completadas: donde la cantidad ahorrada es mayor o igual que la meta
            aggregationPipeline.push({
                $match: {
                    $expr: { $gte: ["$currentSavedAmount", "$targetAmount"] }
                }
            });
        }
        // Si status === "all", no se agrega ningún filtro adicional

        // === CAMPOS CALCULADOS ===
        // Agregar campos calculados a cada documento
        aggregationPipeline.push({
            $addFields: {
                // Campo booleano: true si la meta está completada
                isCompleted: {
                    $gte: ["$currentSavedAmount", "$targetAmount"]
                },
                // Porcentaje de progreso (0-100)
                progressPercentage: {
                    $multiply: [
                        { $divide: ["$currentSavedAmount", "$targetAmount"] },
                        100
                    ]
                },
                // Cantidad restante para alcanzar la meta
                remainingAmount: {
                    $subtract: ["$targetAmount", "$currentSavedAmount"]
                }
            }
        });

        // === PAGINACIÓN Y ORDENAMIENTO ===
        // Calcular cuántos documentos saltar según la página actual
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Agregar ordenamiento (más recientes primero), paginación y límite
        aggregationPipeline.push(
            { $sort: { createdAt: -1 } },     // Ordenar por fecha de creación descendente
            { $skip: skip },                   // Saltar los documentos de páginas anteriores
            { $limit: parseInt(limit) }        // Limitar la cantidad de resultados
        );

        // Ejecutar la consulta con agregación
        const savingGoals = await SavingGoal.aggregate(aggregationPipeline);

        // === CONTAR TOTAL PARA PAGINACIÓN ===
        // Crear un pipeline separado para contar el total de documentos
        // (necesario para calcular el número total de páginas)
        const countPipeline = [
            { $match: { userId } }  // Filtrar por usuario
        ];

        // Aplicar los mismos filtros de estado que en la consulta principal
        if (status === "active") {
            countPipeline.push({
                $match: {
                    $expr: { $lt: ["$currentSavedAmount", "$targetAmount"] }
                }
            });
        } else if (status === "completed") {
            countPipeline.push({
                $match: {
                    $expr: { $gte: ["$currentSavedAmount", "$targetAmount"] }
                }
            });
        }

        // Ejecutar el conteo
        const totalCount = await SavingGoal.aggregate([
            ...countPipeline,
            { $count: "total" }  // Contar documentos y nombrar el resultado "total"
        ]);

        // Extraer el número total (si no hay resultados, usar 0)
        const total = totalCount[0]?.total || 0;

        // Devolver los resultados con información de paginación
        res.status(200).json({
            savingGoals,                                    // Array de metas de ahorro
            pagination: {
                currentPage: parseInt(page),                // Página actual
                totalPages: Math.ceil(total / parseInt(limit)), // Total de páginas
                totalItems: total,                          // Total de elementos
                itemsPerPage: parseInt(limit)               // Elementos por página
            }
        });
    } catch (error) {
        // Manejo de errores
        next(error);
    }
}

// Controlador para obtener una meta de ahorro específica por su ID
export async function getSavingGoalById(req, res, next) {
    try {
        const userId = validateAuthenticatedUser(req, res);
        const { id } = req.params;

        const savingGoal = await SavingGoal.findOne({ _id: id, userId });
        if (!savingGoal) {
            return res.status(404).json({ error: "Meta de ahorro no encontrada" });
        }
        res.status(200).json(savingGoal);
    } catch (error) {
        next(error);
    }
}

// Controlador para actualizar una meta de ahorro existente
// Permite actualización parcial con validaciones completas
export async function updateSavingGoal(req, res, next) {
    try {
        const userId = validateAuthenticatedUser(req, res);

        const { id } = req.params;
        const updateData = req.body;

        const savingGoal = await SavingGoal.findOne({ _id: id, userId });
        if (!savingGoal) {
            return res.status(404).json({ error: "Meta de ahorro no encontrada" });
        }

        // Combinar valores actuales con los cambios propuestos
        const updatedValues = { ...savingGoal.toObject(), ...updateData };

        if (updatedValues.currentSavedAmount < 0) {
            return res.status(400).json({ error: "La cantidad ahorrada actual no puede ser negativa" });
        }
        if (updatedValues.targetAmount <= 0) {
            return res.status(400).json({ error: "La meta de ahorro debe ser mayor a cero" });
        }
        if (updatedValues.monthlySavingGoal <= 0) {
            return res.status(400).json({ error: "La meta de ahorro mensual debe ser mayor a cero" });
        }
        if (new Date(updatedValues.startDate) >= new Date(updatedValues.targetDate)) {
            return res.status(400).json({ error: "La fecha de inicio debe ser anterior a la fecha objetivo" });
        }
        if (updatedValues.monthlySavingGoal > updatedValues.targetAmount) {
            return res.status(400).json({ error: "La meta de ahorro mensual no puede ser mayor a la meta total" });
        }
        // Permitir que currentSavedAmount sea >= targetAmount (meta completada)
        const remainingAmount = Math.max(0, updatedValues.targetAmount - updatedValues.currentSavedAmount);
        if (remainingAmount > 0 && updatedValues.monthlySavingGoal > remainingAmount) {
            return res.status(400).json({ error: "La meta de ahorro mensual no puede ser mayor a la cantidad restante para alcanzar la meta" });
        }

        Object.keys(updateData).forEach(key => {
            // Solo actualizar campos que fueron proporcionados
            if (updateData[key] !== undefined) {
                savingGoal[key] = updateData[key];
            }
        });
        const updatedSavingGoal = await savingGoal.save();

        const responseGoal = updatedSavingGoal.toObject();

        // Agregar campos calculados útiles para el frontend
        responseGoal.isCompleted = responseGoal.currentSavedAmount >= responseGoal.targetAmount;
        responseGoal.progressPercentage = Math.round((responseGoal.currentSavedAmount / responseGoal.targetAmount) * 100);
        responseGoal.remainingAmount = Math.max(0, responseGoal.targetAmount - responseGoal.currentSavedAmount);

        res.status(200).json(responseGoal);
    } catch (error) {
        next(error);
    }
}

//  Controlador para eliminar una meta de ahorro
export async function deleteSavingGoal(req, res, next) {
    try {
        const userId = validateAuthenticatedUser(req, res);
        const { id } = req.params;

        const deletedSavingGoal = await SavingGoal.findOneAndDelete({ _id: id, userId });

        if (!deletedSavingGoal) {
            return res.status(404).json({ error: "Meta de ahorro no encontrada" });
        }

        res.status(200).json({
            message: "Meta de ahorro eliminada exitosamente",
            deletedSavingGoal
        });
    } catch (error) {
        next(error);
    }
}
