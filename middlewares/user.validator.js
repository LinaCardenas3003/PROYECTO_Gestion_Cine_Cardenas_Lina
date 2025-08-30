import { body } from 'express-validator';

export const createUserValidator = [
    body('id').isLength({ min: 3 }).exists().withMessage('La identificación es obligatoria y debe tener mínimo 3 caracteres.'),
    body('name').isLength({ min: 2 }).exists().withMessage('El nombre debe existir con mínimo 2 caracteres.'),
    body('phone').isMobilePhone('es-CO').exists().withMessage('El nùmero telefónico es obligatorio y debe ser válido.'),
    body('email').isEmail().exists().withMessage('El email es obligatorio y debe ser válido'),
    body('position').isLength({ min: 2 }).exists().withMessage('El cargo es obligatorio y debe tener mínimo 2 caracteres.'),
    body('password').isStrongPassword().exists().withMessage('El password es obligatorio y debe ser uno fuerte.')
];

export const updateUserValidator = createUserValidator.filter((val, ind )=> ind <= 2 );

export const loginValidator = [
    body('email').isEmail().exists().withMessage('El email es obligatorio y debe ser válido'),
    body('password').exists().withMessage('Debe enviar la contraseña')
];