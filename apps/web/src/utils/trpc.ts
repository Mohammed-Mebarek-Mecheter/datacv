// src/utils/trpc.ts
import { QueryCache, QueryClient } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from "../../../server/src/routers";
import { toast } from 'sonner';

export const queryClient = new QueryClient({
    queryCache: new QueryCache({
        onError: (error) => {
            toast.error(error.message);
        },
    }),
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
        },
    },
});

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
    links: [
        httpBatchLink({
            url: `${process.env.NEXT_PUBLIC_SERVER_URL}/trpc`,
            fetch(url, options) {
                return fetch(url, {
                    ...options,
                    credentials: 'include',
                });
            },
        }),
    ],
});
