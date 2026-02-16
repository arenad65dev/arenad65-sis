import { z } from 'zod';

export const clientSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    cpf: z.string().length(11).optional().or(z.literal('')),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal(''))
});

export type CreateClientDTO = z.infer<typeof clientSchema>;
