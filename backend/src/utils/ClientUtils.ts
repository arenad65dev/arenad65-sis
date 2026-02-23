import { z } from 'zod';

export const clientSchema = z.object({
    name: z.string().trim().min(1, "Nome é obrigatório"),
    cpf: z.preprocess(
        (value) => typeof value === 'string' ? value.replace(/\D/g, '') : value,
        z.string().length(11, "CPF deve ter 11 dígitos").optional().or(z.literal(''))
    ),
    phone: z.string().trim().min(1, "Telefone é obrigatório"),
    email: z.string().trim().email().optional().or(z.literal(''))
});

export type CreateClientDTO = z.infer<typeof clientSchema>;
