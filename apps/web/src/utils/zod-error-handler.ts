// utils/zod-error-handler.ts
import { z } from 'zod';

export function handleZodErrors(error: unknown): Record<string, string> {
    const newErrors: Record<string, string> = {};
    if (error instanceof z.ZodError) {
        error.issues.forEach((err) => {
            if (err.path.length > 0) {
                newErrors[err.path[0] as string] = err.message;
            }
        });
    }
    return newErrors;
}
